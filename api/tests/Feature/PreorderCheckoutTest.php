<?php

namespace Tests\Feature;

use App\Models\Basket;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PreorderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_preorder_uses_a_fixed_euro_amount_and_webhook_confirms_it_once(): void
    {
        config()->set('checkout.mode', 'preorder');
        config()->set('services.stripe.secret', 'sk_test_example');
        config()->set('services.stripe.webhook_secret', 'whsec_example');
        Http::fake(['https://api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_test_preorder', 'url' => 'https://checkout.stripe.test/cs_test_preorder',
        ])]);
        $user = User::factory()->create();
        $register = $this->basketRegister($user);
        $image = ProductImage::create([
            'good_id' => $register->good_id,
            'color_id' => $register->color_id,
            'name' => 'Preorder color',
            'path' => 'goods/preorder-color.png',
        ]);

        $created = $this->withToken($this->accessToken($user))
            ->postJson('/api/preorders', ['idempotency_key' => 'f1b17a54-af4a-4f0d-a6fe-e37e4f08f4c8'])
            ->assertCreated()
            ->assertJsonPath('data.payment_amount_cents', 100)
            ->assertJsonPath('data.currency', 'eur')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.checkout_url', 'https://checkout.stripe.test/cs_test_preorder');
        $checkoutId = $created->json('data.id');
        $this->assertDatabaseCount('preorders', 0);
        $this->assertDatabaseHas('preorder_checkout_sessions', [
            'id' => $checkoutId,
            'stripe_checkout_session_id' => 'cs_test_preorder',
        ]);
        $this->withToken($this->accessToken($user))
            ->getJson('/api/stripe/checkout-sessions/cs_test_preorder')
            ->assertOk()
            ->assertJsonPath('data.id', $checkoutId)
            ->assertJsonPath('data.payment_status', 'pending');
        $this->withToken($this->accessToken(User::factory()->create()))
            ->getJson('/api/stripe/checkout-sessions/cs_test_preorder')
            ->assertForbidden();
        $this->assertDatabaseHas('baskets', ['user_id' => $user->id, 'good_register_id' => $register->id, 'quantity' => 2]);
        $this->assertDatabaseHas('good_register', ['id' => $register->id, 'quantity' => 8]);

        $event = [
            'id' => 'evt_preorder_paid',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_preorder', 'metadata' => ['preorder_checkout_session_id' => (string) $checkoutId],
                'payment_status' => 'paid', 'amount_total' => 100, 'currency' => 'eur', 'payment_intent' => 'pi_preorder_paid',
            ]],
        ];
        $payload = json_encode($event, JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_example');
        foreach (range(1, 2) as $attempt) {
            $this->postJson('/api/webhooks/stripe', $event, ['Stripe-Signature' => "t={$timestamp},v1={$signature}"])
                ->assertOk();
        }
        $this->assertDatabaseHas('preorders', ['payment_status' => 'paid', 'stripe_payment_intent_id' => 'pi_preorder_paid']);
        $this->assertDatabaseHas('preorder_registers', [
            'good_register_id' => $register->id,
            'original_unit_price' => '89.99',
            'quantity' => 2,
        ]);
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);
        $this->assertDatabaseHas('preorder_checkout_sessions', ['id' => $checkoutId, 'payment_status' => 'paid']);
        $this->assertDatabaseCount('stripe_webhook_events', 1);
        $this->withToken($this->accessToken($user))
            ->getJson('/api/preorders')
            ->assertOk()
            ->assertJsonPath('data.0.registers.0.images.0.id', $image->id);
    }

    public function test_stripe_webhook_rejects_an_invalid_signature(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_example');

        $this->postJson('/api/webhooks/stripe', ['id' => 'evt_invalid', 'type' => 'checkout.session.completed'], [
            'Stripe-Signature' => 't='.time().',v1=invalid',
        ])->assertStatus(400);
        $this->assertDatabaseCount('stripe_webhook_events', 0);
    }

    private function basketRegister(User $user): GoodRegister
    {
        $category = Category::create(['name' => 'Accessories']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Bags']);
        $color = Color::create(['name' => 'Brown', 'hexcode' => '#9a5a35']);
        $good = Good::create(['name' => 'Leather Bag', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id, 'price' => '89.99', 'current_quantity' => 8, 'description' => 'Bag', 'visible' => true]);
        $good->colors()->attach($color);
        $register = GoodRegister::query()->where('good_id', $good->id)->where('color_id', $color->id)->firstOrFail();
        $register->update(['quantity' => 8]);
        Basket::create(['user_id' => $user->id, 'good_id' => $good->id, 'color_id' => $color->id, 'good_register_id' => $register->id, 'quantity' => 2]);

        return $register;
    }
}

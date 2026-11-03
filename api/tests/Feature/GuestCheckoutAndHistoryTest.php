<?php

namespace Tests\Feature;

use App\Enums\PreorderPaymentStatus;
use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Color;
use App\Models\GuestSession;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\Preorder;
use App\Models\Order;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GuestCheckoutAndHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_basket_validation_deduplicates_clamps_and_excludes_unavailable_inventory(): void
    {
        [$available, $unavailable] = $this->registers();

        $this->postJson('/api/basket/validate', [
            'items' => [
                ['inventory_id' => $available->id, 'quantity' => 7],
                ['inventory_id' => $available->id, 'quantity' => 7],
                ['inventory_id' => $unavailable->id, 'quantity' => 1],
                ['inventory_id' => 999999, 'quantity' => 1],
            ],
        ])->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $available->id)
            ->assertJsonPath('data.0.good_register_id', $available->id)
            ->assertJsonPath('data.0.quantity', 10);

        $this->postJson('/api/basket/validate', ['items' => [['inventory_id' => $available->id, 'quantity' => 0]]])
            ->assertUnprocessable();
        $this->postJson('/api/basket/validate', ['items' => array_fill(0, 21, ['inventory_id' => $available->id, 'quantity' => 1])])
            ->assertUnprocessable();
    }

    public function test_guest_payment_is_cookie_authorized_and_never_exposes_authenticated_preorders(): void
    {
        config()->set('checkout.mode', 'preorder');
        config()->set('services.stripe.secret', 'sk_test_example');
        config()->set('services.stripe.webhook_secret', 'whsec_example');
        config()->set('guest_sessions.secure', false);
        Http::fake(['https://api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_guest_preorder', 'url' => 'https://checkout.stripe.test/cs_guest_preorder',
        ])]);
        [$register] = $this->registers();

        $started = $this->postJson('/api/preorders', [
            'idempotency_key' => 'f1b17a54-af4a-4f0d-a6fe-e37e4f08f4c9',
            'items' => [['inventory_id' => $register->id, 'quantity' => 2]],
        ])->assertCreated()->assertCookie('guest_token');
        $cookie = $started->headers->getCookies()[0]->getValue();
        $checkoutId = $started->json('data.id');

        $this->getJson('/api/preorders/guest')->assertOk()->assertJsonPath('meta.total', 0);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)->getJson('/api/preorders/guest')->assertOk()->assertJsonPath('meta.total', 0);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson('/api/stripe/checkout-sessions/cs_guest_preorder')
            ->assertOk()->assertJsonPath('data.id', $checkoutId);
        $this->withCredentials()->withUnencryptedCookie('guest_token', rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '='))
            ->getJson('/api/stripe/checkout-sessions/cs_guest_preorder')->assertForbidden();

        $event = [
            'id' => 'evt_guest_paid',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_guest_preorder',
                'metadata' => ['preorder_checkout_session_id' => (string) $checkoutId],
                'payment_status' => 'paid', 'amount_total' => 100, 'currency' => 'eur', 'payment_intent' => 'pi_guest_paid',
                'customer_details' => ['email' => 'guest@example.test', 'name' => 'Guest Buyer'],
            ]],
        ];
        $payload = json_encode($event, JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_example');
        $this->postJson('/api/webhooks/stripe', $event, ['Stripe-Signature' => "t={$timestamp},v1={$signature}"])->assertOk();

        $session = GuestSession::firstOrFail();
        $account = User::factory()->create();
        Preorder::create([
            'user_id' => $account->id,
            'guest_session_id' => $session->id,
            'customer_name' => 'Authenticated user', 'customer_email' => 'account@example.test',
            'payment_status' => PreorderPaymentStatus::Paid, 'payment_amount_cents' => 100,
            'currency' => 'eur', 'idempotency_key' => 'f1b17a54-af4a-4f0d-a6fe-e37e4f08f4d0',
        ]);
        Order::create([
            'guest_session_id' => $session->id,
            'customer_name' => 'Guest Buyer', 'customer_email' => 'guest@example.test',
            'status' => OrderStatus::Processing, 'placed_at' => now(),
        ]);
        Order::create([
            'user_id' => $account->id, 'guest_session_id' => $session->id,
            'customer_name' => 'Authenticated user', 'customer_email' => 'account@example.test',
            'status' => OrderStatus::Processing, 'placed_at' => now(),
        ]);

        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson('/api/preorders/guest?per_page=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.customer_email', 'guest@example.test')
            ->assertJsonPath('data.0.user_id', null)
            ->assertJsonPath('data.0.registers.0.good_register_id', $register->id);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson('/api/orders/guest?per_page=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.user_id', null);
        $this->withCredentials()->withUnencryptedCookie('guest_token', rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '='))
            ->getJson('/api/preorders/guest')
            ->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_missing_invalid_and_expired_guest_tokens_return_empty_history(): void
    {
        $expiredToken = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        GuestSession::create(['token_hash' => hash('sha256', $expiredToken), 'expires_at' => now()->subMinute()]);

        $this->getJson('/api/orders/guest')->assertOk()->assertJsonPath('meta.total', 0);
        $this->withCredentials()->withUnencryptedCookie('guest_token', 'not-a-valid-token')
            ->getJson('/api/preorders/guest')->assertOk()->assertJsonPath('meta.total', 0);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $expiredToken)
            ->getJson('/api/orders/guest')->assertOk()->assertJsonPath('meta.total', 0);
    }

    /** @return array{0: GoodRegister, 1: GoodRegister} */
    private function registers(): array
    {
        $category = Category::create(['name' => 'Guest category']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Guest subcategory']);
        $color = Color::create(['name' => 'Guest blue', 'hexcode' => '#0000ff']);
        $good = Good::create(['name' => 'Guest good', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id, 'price' => '30.00', 'current_quantity' => 10, 'description' => 'Guest', 'visible' => true]);
        $good->colors()->attach($color);
        $available = GoodRegister::query()->where('good_id', $good->id)->where('color_id', $color->id)->firstOrFail();
        $available->update(['quantity' => 10]);
        $unavailable = new GoodRegister(['color_id' => $color->id, 'size' => 'Unavailable', 'quantity' => 0]);
        $unavailable->good_id = $good->id;
        $unavailable->save();

        return [$available, $unavailable];
    }
}

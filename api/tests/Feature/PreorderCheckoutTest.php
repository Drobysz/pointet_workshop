<?php

namespace Tests\Feature;

use App\Jobs\DeliverTransactionalEmail;
use App\Mail\TransactionalMail;
use App\Models\Basket;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\TransactionalEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Tests\TestCase;

class PreorderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_preorder_uses_a_fixed_euro_amount_and_webhook_confirms_it_once(): void
    {
        config()->set('checkout.mode', 'preorder');
        config()->set('services.frontend.url', 'https://workshop.example.test');
        config()->set('services.stripe.secret', 'sk_test_example');
        config()->set('services.stripe.webhook_secret', 'whsec_example');
        Http::fake(['https://api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_test_preorder', 'url' => 'https://checkout.stripe.test/cs_test_preorder',
        ])]);
        $user = User::factory()->create(['language' => 'fr', 'full_name' => 'Camille']);
        $register = $this->basketRegister($user);
        $secondVariant = $register->good->inventory()->create(['color_id' => $register->color_id, 'size' => 'XL', 'quantity' => 4]);
        Basket::create(['user_id' => $user->id, 'good_id' => $register->good_id, 'color_id' => $register->color_id, 'good_register_id' => $secondVariant->id, 'quantity' => 3]);
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
            'customer_email' => $user->email,
            'stripe_checkout_session_id' => 'cs_test_preorder',
        ]);
        Http::assertSent(fn ($request) => $request['customer_email'] === $user->email);
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

        $this->assertDatabaseCount('transactional_emails', 0);
        $register->good->update(['name' => 'Renamed Bag', 'price' => '120.00']);
        Basket::query()->where('user_id', $user->id)->update(['quantity' => 1]);

        $event = [
            'id' => 'evt_preorder_paid',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_preorder', 'metadata' => ['preorder_checkout_session_id' => (string) $checkoutId],
                'payment_status' => 'paid', 'amount_total' => 100, 'currency' => 'eur', 'payment_intent' => 'pi_preorder_paid',
            ]],
        ];
        $unpaid = $event;
        $unpaid['id'] = 'evt_preorder_unpaid';
        $unpaid['data']['object']['payment_status'] = 'unpaid';
        $this->sendStripeEvent($unpaid);
        $this->assertDatabaseCount('transactional_emails', 0);

        $failed = $event;
        $failed['id'] = 'evt_preorder_failed';
        $failed['type'] = 'checkout.session.async_payment_failed';
        $failed['data']['object']['payment_status'] = 'unpaid';
        $this->sendStripeEvent($failed);
        $this->assertDatabaseCount('transactional_emails', 0);

        $expired = $failed;
        $expired['id'] = 'evt_preorder_expired';
        $expired['type'] = 'checkout.session.expired';
        $this->sendStripeEvent($expired);
        $this->assertDatabaseCount('transactional_emails', 0);

        $this->sendStripeEvent($event);
        $this->sendStripeEvent($event);
        $this->sendStripeEvent([...$event, 'id' => 'evt_paid_again', 'type' => 'checkout.session.async_payment_succeeded']);

        $this->assertDatabaseCount('transactional_emails', 1);
        $notification = TransactionalEmail::firstOrFail();

        $mailer = Mail::getFacadeRoot();
        Mail::shouldReceive('to')->once()->with($user->email)->andThrow(new RuntimeException('Mail transport unavailable'));
        (new DeliverTransactionalEmail($notification->id))->handle();
        $notification->refresh();
        $this->assertNull($notification->sent_at);
        $this->assertSame(1, $notification->attempts);
        $this->assertTrue($notification->available_at->isFuture());
        $this->assertDatabaseHas('preorders', ['payment_status' => 'paid']);

        Mail::swap($mailer);
        Mail::fake();
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        Mail::assertNothingOutgoing();
        $this->travel(2)->minutes();
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        (new DeliverTransactionalEmail($notification->id))->handle();
        $this->travelBack();

        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($user): bool {
            $mail->assertHasSubject('Votre précommande est confirmée — Pointet');
            $mail->assertSeeInHtml('Bonjour Camille');
            $mail->assertSeeInHtml('Leather Bag');
            $mail->assertSeeInHtml('Brown');
            $mail->assertSeeInHtml('>2</td>', false);
            $mail->assertSeeInHtml('>3</td>', false);
            $mail->assertSeeInText('Brown · XL | 3');
            $mail->assertSeeInText('1,00');
            $mail->assertDontSeeInHtml('Renamed Bag');
            $mail->assertDontSeeInText('89,99');
            $mail->assertSeeInHtml('https://workshop.example.test/fr/profile/preorders/');

            return $mail->locale === 'fr' && $mail->hasTo($user->email);
        });
        Mail::assertSentCount(1);
        $this->assertNotNull($notification->fresh()->sent_at);
        $this->assertDatabaseHas('preorders', ['payment_status' => 'paid', 'stripe_payment_intent_id' => 'pi_preorder_paid']);
        $this->assertDatabaseHas('preorder_registers', [
            'good_register_id' => $register->id,
            'original_unit_price' => '89.99',
            'quantity' => 2,
        ]);
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);
        $this->assertDatabaseHas('preorder_checkout_sessions', ['id' => $checkoutId, 'payment_status' => 'paid']);
        $this->assertDatabaseCount('stripe_webhook_events', 5);
        $this->withToken($this->accessToken($user))
            ->getJson('/api/preorders')
            ->assertOk()
            ->assertJsonCount(2, 'data.0.registers')
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

    public function test_authenticated_checkout_uses_account_email_instead_of_submitted_contact_email(): void
    {
        config()->set('checkout.mode', 'preorder');
        config()->set('services.stripe.secret', 'sk_test_example');
        Http::fake(['https://api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_account_email', 'url' => 'https://checkout.stripe.test/cs_account_email',
        ])]);
        $user = User::factory()->create();
        $this->basketRegister($user);

        $this->withToken($this->accessToken($user))->postJson('/api/preorders', [
            'idempotency_key' => 'f1b17a54-af4a-4f0d-a6fe-e37e4f08f4c8',
            'email' => 'another@example.test',
        ])->assertCreated();

        $this->assertDatabaseHas('preorder_checkout_sessions', ['user_id' => $user->id, 'customer_email' => $user->email]);
        Http::assertSent(fn ($request) => $request['customer_email'] === $user->email);
    }

    private function sendStripeEvent(array $event): void
    {
        $payload = json_encode($event, JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_example');
        $this->postJson('/api/webhooks/stripe', $event, ['Stripe-Signature' => "t={$timestamp},v1={$signature}"])
            ->assertOk();
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

<?php

namespace Tests\Feature;

use App\Jobs\DeliverTransactionalEmail;
use App\Mail\TransactionalMail;
use App\Models\Basket;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\OrderCheckoutSession;
use App\Models\Subcategory;
use App\Models\TransactionalEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('checkout.mode', 'standard');
        config()->set('services.stripe.secret', 'sk_test_orders');
        config()->set('services.stripe.webhook_secret', 'whsec_orders');
        config()->set('guest_sessions.secure', false);

        $sessionNumber = 0;
        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => function () use (&$sessionNumber) {
                $sessionId = 'cs_test_order_'.++$sessionNumber;

                return Http::response(['id' => $sessionId, 'url' => 'https://checkout.stripe.test/'.$sessionId]);
            },
        ]);
    }

    public function test_creating_an_order_returns_a_stripe_url_for_the_full_basket_total_and_creates_no_order_yet(): void
    {
        [$good, $small, $large] = $this->inventory();
        $user = User::factory()->create();
        $this->basket($user, $small, 2);
        $this->basket($user, $large, 1);

        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])
            ->assertCreated()
            ->assertJsonPath('data.payment_status', 'pending')
            // 3 x 30.00 of goods plus EUR 15 delivery for the single (unbranded) seller.
            ->assertJsonPath('data.payment_amount_cents', 10500)
            ->assertJsonPath('data.delivery_cents', 1500)
            ->assertJsonPath('data.currency', 'eur')
            ->assertJsonPath('data.order_id', null)
            ->assertJsonPath('data.checkout_url', 'https://checkout.stripe.test/cs_test_order_1');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertDatabaseHas('baskets', ['user_id' => $user->id, 'good_register_id' => $small->id]);

        Http::assertSent(function (Request $request): bool {
            $body = $request->data();

            return $request->url() === 'https://api.stripe.com/v1/checkout/sessions'
                && $body['mode'] === 'payment'
                && (int) $body['line_items[0][quantity]'] === 2
                && (int) $body['line_items[0][price_data][unit_amount]'] === 3000
                && $body['line_items[0][price_data][currency]'] === 'eur'
                && $body['line_items[0][price_data][product_data][name]'] === 'Order inventory (Red, S)'
                && (int) $body['line_items[1][quantity]'] === 1
                && (int) $body['line_items[2][quantity]'] === 1
                && (int) $body['line_items[2][price_data][unit_amount]'] === 1500
                && $body['line_items[2][price_data][product_data][name]'] === 'Delivery'
                && ! isset($body['line_items[3][quantity]'])
                && isset($body['metadata[order_checkout_session_id]'])
                && str_contains($body['cancel_url'], 'order=cancelled');
        });

        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->assertSame($good->id, $checkout->basket_snapshot[0]['good_id']);
    }

    public function test_paid_webhook_creates_the_order_deducts_stock_and_clears_the_basket_once(): void
    {
        [$good, $small, $large] = $this->inventory();
        $user = User::factory()->create();
        $this->basket($user, $small, 2);
        $this->basket($user, $large, 1);
        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])
            ->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $version = $good->inventory_version;

        $this->stripeEvent($checkout, eventId: 'evt_order_paid')->assertOk();
        $this->stripeEvent($checkout, eventId: 'evt_order_paid')->assertOk();
        $this->stripeEvent($checkout, type: 'checkout.session.async_payment_succeeded')->assertOk();

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'processing', 'customer_email' => $user->email]);
        $this->assertDatabaseHas('order_items', ['good_register_id' => $small->id, 'quantity' => 2, 'unit_price' => '30.00', 'size' => 'S', 'color_name' => 'Red']);
        $this->assertDatabaseHas('order_items', ['good_register_id' => $large->id, 'quantity' => 1]);
        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(3, $large->fresh()->quantity);
        $this->assertSame(9, $good->fresh()->current_quantity);
        $this->assertSame($version + 1, $good->fresh()->inventory_version);
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);

        $checkout->refresh();
        $this->assertSame('paid', $checkout->payment_status->value);
        $this->assertNotNull($checkout->order_id);

        $this->withToken($this->accessToken($user))
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $checkout->order_id)
            ->assertJsonPath('data.0.quantity', 3)
            ->assertJsonPath('data.0.total', '90.00');
    }

    public function test_guest_checkout_requires_an_email_and_the_paid_order_appears_in_guest_history(): void
    {
        [, $small] = $this->inventory();

        $this->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid(), 'items' => [['inventory_id' => $small->id, 'quantity' => 1]]])
            ->assertUnprocessable();
        $this->assertDatabaseCount('order_checkout_sessions', 0);

        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]], $cookie);
        $this->assertSame(7500, $checkout->payment_amount_cents);
        $this->assertSame(1500, $checkout->delivery_cents);
        $this->assertDatabaseCount('orders', 0);

        $this->stripeEvent($checkout)->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $checkout->fresh()->order_id, 'user_id' => null, 'customer_email' => 'guest@example.test']);
        $this->assertSame(3, $small->fresh()->quantity);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson('/api/orders/guest')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.quantity', 2);
    }

    public function test_checkout_status_endpoint_reports_the_order_once_paid_and_hides_it_from_strangers(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $sessionId = $checkout->stripe_checkout_session_id;
        $owner = fn () => $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie);

        $owner()->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.order_id', null);

        $this->stripeEvent($checkout)->assertOk();

        $owner()->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.order_id', $checkout->fresh()->order_id);

        // The test client keeps cookies between requests, so strangers send a different guest token.
        $stranger = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $this->withCredentials()->withUnencryptedCookie('guest_token', $stranger)
            ->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertForbidden();
        $this->withCredentials()->withUnencryptedCookie('guest_token', $stranger)
            ->withToken($this->accessToken(User::factory()->create()))
            ->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertForbidden();
    }

    public function test_guest_name_address_and_email_are_stored_on_the_order_and_beat_the_stripe_cardholder_name(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout(
            [['inventory_id' => $small->id, 'quantity' => 1]],
            $cookie,
            ['full_name' => 'Anna Kowalska', 'address' => "ul. Długa 5/12\n00-238 Warszawa, Poland"],
        );
        $this->assertDatabaseHas('order_checkout_sessions', ['id' => $checkout->id, 'customer_name' => 'Anna Kowalska']);

        $this->stripeEvent($checkout, customerDetails: ['name' => 'A KOWALSKA CARDHOLDER', 'email' => 'card@example.test'])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $checkout->fresh()->order_id,
            'user_id' => null,
            'customer_name' => 'Anna Kowalska',
            'customer_email' => 'guest@example.test',
            'customer_address' => "ul. Długa 5/12\n00-238 Warszawa, Poland",
        ]);
        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson('/api/orders/guest')
            ->assertOk()
            ->assertJsonPath('data.0.customer_name', 'Anna Kowalska')
            ->assertJsonPath('data.0.customer_email', 'guest@example.test')
            ->assertJsonPath('data.0.customer_address', "ul. Długa 5/12\n00-238 Warszawa, Poland");
    }

    public function test_guest_name_and_address_are_optional(): void
    {
        [, $small] = $this->inventory();

        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie, ['full_name' => '', 'address' => null]);
        $this->stripeEvent($checkout, customerDetails: ['name' => 'Stripe Name'])->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $checkout->fresh()->order_id, 'customer_name' => 'Stripe Name', 'customer_address' => null]);

        $unnamed = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $this->stripeEvent($unnamed)->assertOk();
        $this->assertDatabaseHas('orders', ['id' => $unnamed->fresh()->order_id, 'customer_name' => 'Guest checkout', 'customer_address' => null]);

        $this->postJson('/api/orders', [
            'idempotency_key' => (string) Str::uuid(), 'email' => 'guest@example.test',
            'items' => [['inventory_id' => $small->id, 'quantity' => 1]], 'address' => str_repeat('a', 501),
        ])->assertUnprocessable()->assertJsonValidationErrors('address');
    }

    public function test_authenticated_orders_keep_the_account_details_and_ignore_submitted_ones(): void
    {
        [, $small] = $this->inventory();
        $user = User::factory()->create(['full_name' => 'Account Owner', 'address' => '1 Account Street']);
        $this->basket($user, $small, 1);

        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid(), 'full_name' => 'Someone Else', 'address' => 'Elsewhere 9'])
            ->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->stripeEvent($checkout, customerDetails: ['name' => 'Card Holder', 'email' => 'card@example.test'])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $checkout->fresh()->order_id,
            'user_id' => $user->id,
            'customer_name' => 'Account Owner',
            'customer_email' => $user->email,
            'customer_address' => '1 Account Street',
        ]);
    }

    public function test_paid_order_queues_a_localized_confirmation_email_with_delivery_details(): void
    {
        config()->set('services.frontend.url', 'https://workshop.example.test');
        [, $small] = $this->inventory();
        // Guest first: the test client keeps the bearer token once an account request is made.
        $guestCheckout = $this->guestCheckout(
            [['inventory_id' => $small->id, 'quantity' => 1]],
            $cookie,
            ['full_name' => 'Anna Kowalska', 'address' => 'ul. Długa 5, Warszawa'],
        );
        $user = User::factory()->create(['language' => 'fr', 'full_name' => 'Camille', 'address' => '12 rue de la Paix, Paris']);
        $this->basket($user, $small, 2);
        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])
            ->assertCreated();
        $userCheckout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->stripeEvent($userCheckout)->assertOk();
        $this->stripeEvent($guestCheckout)->assertOk();
        $this->stripeEvent($guestCheckout, eventId: 'evt_duplicate_after')->assertOk();

        $this->assertDatabaseCount('transactional_emails', 2);
        $userEmail = TransactionalEmail::where('event_key', 'order:'.$userCheckout->fresh()->order_id)->firstOrFail();
        $guestEmail = TransactionalEmail::where('event_key', 'order:'.$guestCheckout->fresh()->order_id)->firstOrFail();
        $this->assertSame(['order', 'fr'], [$userEmail->template, $userEmail->locale]);
        $this->assertSame(['order', 'en'], [$guestEmail->template, $guestEmail->locale]);

        Mail::fake();
        (new DeliverTransactionalEmail($userEmail->id))->handle();
        (new DeliverTransactionalEmail($guestEmail->id))->handle();

        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($user): bool {
            if (! $mail->hasTo($user->email)) {
                return false;
            }
            $mail->assertHasSubject('Votre commande est confirmée — Pointet');
            $mail->assertSeeInHtml('Bonjour Camille');
            $mail->assertSeeInHtml('Order inventory');
            $mail->assertSeeInHtml('Informations de livraison');
            $mail->assertSeeInHtml('12 rue de la Paix, Paris');
            $mail->assertSeeInHtml('https://workshop.example.test/fr/profile/orders/');
            $mail->assertSeeInText('Red · S | 2');
            $mail->assertSeeInText('75,00');

            return $mail->locale === 'fr' && $mail->hasTo($user->email);
        });
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail): bool {
            if (! $mail->hasTo('guest@example.test')) {
                return false;
            }
            $mail->assertHasSubject('Your Order Is Confirmed — Pointet');
            $mail->assertSeeInHtml('Hello, Anna Kowalska,');
            $mail->assertSeeInHtml('Delivery details');
            $mail->assertSeeInHtml('ul. Długa 5, Warszawa');
            $mail->assertSeeInText('Order #');
            $mail->assertDontSeeInHtml('/profile/orders/');

            return $mail->hasTo('guest@example.test');
        });
        Mail::assertSentCount(2);
    }

    public function test_unpaid_failed_and_expired_sessions_never_create_orders_or_take_stock(): void
    {
        [$good, $small] = $this->inventory();
        $version = $good->inventory_version;

        $pending = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);
        $this->stripeEvent($pending, paymentStatus: 'unpaid')->assertOk();
        $this->assertSame('pending', $pending->fresh()->payment_status->value);

        foreach (['checkout.session.expired' => 'canceled', 'checkout.session.async_payment_failed' => 'failed'] as $type => $status) {
            $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);
            $this->stripeEvent($checkout, type: $type, paymentStatus: 'unpaid')->assertOk();
            $this->assertSame($status, $checkout->fresh()->payment_status->value);
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame($version, $good->fresh()->inventory_version);
    }

    public function test_a_payment_amount_that_differs_from_the_snapshot_total_is_rejected(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);

        $this->stripeEvent($checkout, amount: 100)->assertUnprocessable();
        $this->stripeEvent($checkout, currency: 'usd')->assertUnprocessable();

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame('pending', $checkout->fresh()->payment_status->value);
    }

    public function test_insufficient_stock_at_payment_time_rolls_everything_back_and_can_be_retried(): void
    {
        [, $small, $large] = $this->inventory();
        $checkout = $this->guestCheckout([
            ['inventory_id' => $small->id, 'quantity' => 2],
            ['inventory_id' => $large->id, 'quantity' => 4],
        ]);
        $competing = $this->guestCheckout([['inventory_id' => $large->id, 'quantity' => 1]]);
        $this->stripeEvent($competing)->assertOk();

        $this->stripeEvent($checkout, eventId: 'evt_order_retry')->assertUnprocessable();

        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(3, $large->fresh()->quantity);
        $this->assertSame('pending', $checkout->fresh()->payment_status->value);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseMissing('stripe_webhook_events', ['stripe_event_id' => 'evt_order_retry']);

        $large->increment('quantity');
        $this->stripeEvent($checkout, eventId: 'evt_order_retry')->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(0, $large->fresh()->quantity);
        $this->assertDatabaseCount('orders', 2);
    }

    public function test_idempotency_key_returns_the_same_checkout_and_duplicate_guest_lines_are_merged_and_clamped_to_stock(): void
    {
        [, $small] = $this->inventory();
        $key = (string) Str::uuid();
        $data = ['idempotency_key' => $key, 'email' => 'guest@example.test', 'items' => [
            ['inventory_id' => $small->id, 'quantity' => 4],
            ['inventory_id' => $small->id, 'quantity' => 4],
        ]];

        $first = $this->postJson('/api/orders', $data)->assertCreated();
        $cookie = $first->headers->getCookies()[0]->getValue();
        $retry = fn (array $payload) => $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)->postJson('/api/orders', $payload);

        $second = $retry($data)->assertOk();

        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertDatabaseCount('order_checkout_sessions', 1);
        $this->assertSame(16500, $first->json('data.payment_amount_cents'));

        $retry(array_replace($data, ['email' => 'other@example.test']))->assertStatus(409);
        Http::assertSentCount(1);

        $this->stripeEvent(OrderCheckoutSession::findOrFail($first->json('data.id')))->assertOk();
        $this->assertSame(0, $small->fresh()->quantity);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('order_items', ['good_register_id' => $small->id, 'quantity' => 5]);
    }

    public function test_orders_are_only_checked_out_in_standard_mode_and_need_a_basket_and_stripe(): void
    {
        [, $small] = $this->inventory();
        $user = User::factory()->create();
        $payload = ['idempotency_key' => (string) Str::uuid()];

        config()->set('checkout.mode', 'preorder');
        $this->withToken($this->accessToken($user))->postJson('/api/orders', $payload)->assertStatus(409);

        config()->set('checkout.mode', 'standard');
        $this->withToken($this->accessToken($user))->postJson('/api/orders', $payload)->assertUnprocessable();

        $this->basket($user, $small, 1);
        config()->set('services.stripe.secret', null);
        $this->withToken($this->accessToken($user))->postJson('/api/orders', $payload)->assertStatus(503);

        $this->assertDatabaseCount('order_checkout_sessions', 0);
        Http::assertNothingSent();
    }

    public function test_preorder_webhooks_are_not_handled_as_orders(): void
    {
        $event = [
            'id' => 'evt_preorder_like',
            'type' => 'checkout.session.completed',
            'data' => ['object' => ['id' => 'cs_unknown', 'metadata' => ['preorder_checkout_session_id' => '1'], 'payment_status' => 'paid']],
        ];

        $this->signedWebhook($event)->assertOk();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_pending_checkout_is_confirmed_with_stripe_when_the_webhook_never_arrives(): void
    {
        [, $small] = $this->inventory();
        $user = User::factory()->create();
        $this->basket($user, $small, 2);
        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])
            ->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $sessionId = $checkout->stripe_checkout_session_id;
        $stripeSession = fn (string $paymentStatus, string $status = 'complete') => [
            'id' => $sessionId,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'amount_total' => $checkout->payment_amount_cents,
            'currency' => 'eur',
            'payment_intent' => 'pi_polled',
            'customer_details' => [],
            'metadata' => ['order_checkout_session_id' => (string) $checkout->id],
        ];
        Http::fake(["https://api.stripe.com/v1/checkout/sessions/{$sessionId}" => Http::sequence()
            ->push($stripeSession('unpaid', 'open'))
            ->push($stripeSession('paid'))
            ->push($stripeSession('paid')),
        ]);

        // Still unpaid at Stripe: nothing happens.
        $this->withToken($this->accessToken($user))->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertOk()->assertJsonPath('data.payment_status', 'pending')->assertJsonPath('data.order_id', null);
        $this->assertDatabaseCount('orders', 0);

        // Paid at Stripe: the poll itself creates the order, exactly once.
        $this->withToken($this->accessToken($user))->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertOk()->assertJsonPath('data.payment_status', 'paid')->assertJsonPath('data.order_id', $checkout->fresh()->order_id);
        $this->withToken($this->accessToken($user))->getJson("/api/stripe/checkout-sessions/{$sessionId}")->assertOk();
        // A late webhook for the same payment is a no-op.
        $this->stripeEvent($checkout)->assertOk();

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'processing']);
        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);
        $this->assertDatabaseCount('transactional_emails', 1);
    }

    public function test_an_unreachable_stripe_does_not_break_the_checkout_status_endpoint(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $sessionId = $checkout->stripe_checkout_session_id;
        Http::fake(["https://api.stripe.com/v1/checkout/sessions/{$sessionId}" => Http::response(['error' => 'down'], 500)]);

        $this->withCredentials()->withUnencryptedCookie('guest_token', $cookie)
            ->getJson("/api/stripe/checkout-sessions/{$sessionId}")
            ->assertOk()->assertJsonPath('data.payment_status', 'pending');
    }

    public function test_an_admin_adds_a_tracking_link_and_the_customer_is_emailed(): void
    {
        config()->set('services.frontend.url', 'https://workshop.example.test');
        [, $small] = $this->inventory();
        $customer = User::factory()->create(['language' => 'de', 'full_name' => 'Jonas']);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->basket($customer, $small, 1);
        $response = $this->withToken($this->accessToken($customer))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->stripeEvent($checkout)->assertOk();
        $orderId = $checkout->fresh()->order_id;
        $url = 'https://tracking.example.test/track?code=AB123';

        $this->withToken($this->accessToken($customer))
            ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => $url])->assertForbidden();
        foreach (['javascript:alert(1)', 'ftp://example.test/x', 'not a url', '', str_repeat('a', 2050)] as $invalid) {
            $this->withToken($this->accessToken($admin))
                ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => $invalid])
                ->assertUnprocessable()->assertJsonValidationErrors('tracking_url');
        }
        $this->assertDatabaseCount('order_tracking_links', 0);

        $this->withToken($this->accessToken($admin))
            ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => "  {$url}  "])
            ->assertCreated()
            ->assertJsonPath('data.tracking_url', $url)
            ->assertJsonPath('data.order_id', $orderId)
            ->assertJsonPath('data.user_id', $admin->id);
        $this->assertDatabaseHas('order_tracking_links', ['order_id' => $orderId, 'user_id' => $admin->id, 'tracking_url' => $url]);
        // The first link moves a processing order (and its lines) to "sent".
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => 'sent']);
        $this->assertDatabaseHas('order_items', ['order_id' => $orderId, 'status' => 'sent']);

        // Admins see the link on the order; the owner sees it too, without who added it.
        $this->withToken($this->accessToken($admin))->getJson("/api/orders/{$orderId}")
            ->assertOk()->assertJsonPath('data.tracking_links.0.tracking_url', $url)->assertJsonPath('data.tracking_links.0.user_id', $admin->id);
        $this->withToken($this->accessToken($customer))->getJson("/api/orders/{$orderId}")
            ->assertOk()->assertJsonPath('data.tracking_links.0.tracking_url', $url)->assertJsonMissingPath('data.tracking_links.0.user_id');
        $this->withToken($this->accessToken($customer))->getJson('/api/orders')->assertOk()->assertJsonMissingPath('data.0.tracking_links');

        $email = TransactionalEmail::where('template', 'tracking')->firstOrFail();
        $this->assertSame('de', $email->locale);
        Mail::fake();
        (new DeliverTransactionalEmail($email->id))->handle();
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($customer, $url): bool {
            $mail->assertHasSubject('Deine Bestellung wurde versandt — Pointet');
            $mail->assertSeeInHtml('Hallo Jonas');
            $mail->assertSeeInHtml($url);
            $mail->assertSeeInHtml('Bestellung verfolgen');
            $mail->assertSeeInText($url);

            return $mail->hasTo($customer->email);
        });
        Mail::assertSentCount(1);

        // A second link is a new shipment notice, not a duplicate of the first.
        $this->withToken($this->accessToken($admin))
            ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => 'https://tracking.example.test/second'])->assertCreated();
        $this->assertSame(2, TransactionalEmail::where('template', 'tracking')->count());
    }

    public function test_a_guest_orders_tracking_email_goes_to_the_checkout_email(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $this->stripeEvent($checkout)->assertOk();
        $orderId = $checkout->fresh()->order_id;
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($this->accessToken($admin))
            ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => 'https://tracking.example.test/guest'])->assertCreated();

        $email = TransactionalEmail::where('template', 'tracking')->firstOrFail();
        $this->assertSame('guest@example.test', $email->payload['recipient']);
        $this->assertSame('en', $email->locale);
    }

    public function test_only_the_first_tracking_link_advances_a_processing_order_to_sent_and_every_link_is_listed(): void
    {
        [, $small] = $this->inventory();
        $customer = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->basket($customer, $small, 1);
        $response = $this->withToken($this->accessToken($customer))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->stripeEvent($checkout)->assertOk();
        $orderId = $checkout->fresh()->order_id;
        $add = fn (string $url) => $this->withToken($this->accessToken($admin))
            ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => $url])->assertCreated();

        $add('https://tracking.example.test/1');
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => 'sent']);

        // An admin rolls the order back; a further link must not push it to "sent" again.
        $this->withToken($this->accessToken($admin))
            ->patchJson("/api/orders/{$orderId}", ['status' => 'processing'])->assertOk();
        $add('https://tracking.example.test/2');
        $add('https://tracking.example.test/3');
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => 'processing']);
        $this->assertDatabaseHas('order_items', ['order_id' => $orderId, 'status' => 'processing']);

        foreach ([$admin, $customer] as $viewer) {
            $this->withToken($this->accessToken($viewer))->getJson("/api/orders/{$orderId}")
                ->assertOk()
                ->assertJsonCount(3, 'data.tracking_links')
                ->assertJsonPath('data.tracking_links.0.tracking_url', 'https://tracking.example.test/1')
                ->assertJsonPath('data.tracking_links.2.tracking_url', 'https://tracking.example.test/3');
        }
        // Three links, three shipment emails (+ one status email for the manual change).
        $this->assertSame(3, TransactionalEmail::where('template', 'tracking')->count());
    }

    public function test_a_tracking_link_never_reopens_a_cancelled_or_reported_order(): void
    {
        [, $small] = $this->inventory();
        $admin = User::factory()->create(['role' => 'admin']);
        // Guest checkouts first: the test client keeps the bearer token once an admin request is made.
        $orders = [];
        foreach (['cancelled', 'reported'] as $status) {
            $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
            $this->stripeEvent($checkout)->assertOk();
            $orders[$status] = $checkout->fresh()->order_id;
        }
        foreach (['cancelled', 'reported'] as $index => $status) {
            $orderId = $orders[$status];
            $this->withToken($this->accessToken($admin))->patchJson("/api/orders/{$orderId}", ['status' => $status])->assertOk();

            $this->withToken($this->accessToken($admin))
                ->postJson("/api/orders/{$orderId}/tracking-links", ['tracking_url' => 'https://tracking.example.test/'.$index])->assertCreated();
            $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => $status]);
        }
    }

    public function test_changing_the_status_emails_the_customer_once_per_real_change(): void
    {
        config()->set('services.frontend.url', 'https://workshop.example.test');
        [, $small] = $this->inventory();
        // Guest first: the test client keeps the bearer token once an account request is made.
        $guestCheckout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $customer = User::factory()->create(['language' => 'de', 'full_name' => 'Jonas']);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->basket($customer, $small, 1);
        $response = $this->withToken($this->accessToken($customer))
            ->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid()])->assertCreated();
        $checkout = OrderCheckoutSession::findOrFail($response->json('data.id'));
        $this->stripeEvent($checkout)->assertOk();
        $this->stripeEvent($guestCheckout)->assertOk();
        $orderId = $checkout->fresh()->order_id;
        $guestOrderId = $guestCheckout->fresh()->order_id;
        $patch = fn (int $id, string $status, ?User $as = null) => $this->withToken($this->accessToken($as ?? $admin))
            ->patchJson("/api/orders/{$id}", ['status' => $status]);

        $patch($orderId, 'sent', $customer)->assertForbidden();
        $patch($orderId, 'bogus')->assertUnprocessable();
        $this->assertDatabaseCount('transactional_emails', 2); // only the two paid-order emails so far

        $patch($orderId, 'sent')->assertOk()->assertJsonPath('data.status', 'sent');
        $patch($orderId, 'sent')->assertOk(); // unchanged: no second email
        $patch($orderId, 'reported')->assertOk();
        $patch($guestOrderId, 'cancelled')->assertOk();

        $this->assertSame(['status_reported', 'status_sent'], TransactionalEmail::where('event_key', 'like', 'status_%:'.$orderId.':%')->orderBy('template')->pluck('template')->all());
        $this->assertSame(3, TransactionalEmail::where('template', 'like', 'status_%')->count());
        $guestEmail = TransactionalEmail::where('template', 'status_cancelled')->firstOrFail();
        $this->assertSame('guest@example.test', $guestEmail->payload['recipient']);
        $this->assertSame('en', $guestEmail->locale);

        $email = TransactionalEmail::where('template', 'status_sent')->firstOrFail();
        $this->assertSame('de', $email->locale);
        Mail::fake();
        (new DeliverTransactionalEmail($email->id))->handle();
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($customer, $orderId): bool {
            $mail->assertHasSubject('Deine Bestellung wurde versandt — Pointet');
            $mail->assertSeeInHtml('Hallo Jonas');
            $mail->assertSeeInHtml('https://workshop.example.test/de/profile/orders/'.$orderId);

            return $mail->hasTo($customer->email);
        });
    }

    public function test_delivery_is_charged_once_per_distinct_brand_in_the_basket(): void
    {
        $category = Category::create(['name' => 'Brand category']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Brand subcategory']);
        $red = Color::create(['name' => 'Red', 'hexcode' => '#ff0000']);
        $register = function (string $name, ?string $brand, string $price) use ($category, $subcategory, $red): GoodRegister {
            $good = Good::create([
                'name' => $name, 'category_id' => $category->id, 'subcategory_id' => $subcategory->id, 'brand' => $brand,
                'price' => $price, 'current_quantity' => 9, 'description' => 'Brand stock', 'visible' => true,
            ]);

            return $good->inventory()->create(['color_id' => $red->id, 'size' => 'M', 'quantity' => 9]);
        };
        $dior1 = $register('Dior bag', 'Dior', '100.00');
        $dior2 = $register('Dior coat', 'Dior', '50.00');
        $chanel = $register('Chanel scarf', 'Chanel', '20.00');
        $diorCase = $register('Lowercase dior', 'dior', '10.00');
        $noBrand1 = $register('Plain tee', null, '5.00');
        $noBrand2 = $register('Plain cap', null, '5.00');
        $line = fn (GoodRegister $r, int $quantity = 1) => ['inventory_id' => $r->id, 'quantity' => $quantity];
        $checkout = fn (array $items) => $this->postJson('/api/orders', [
            'idempotency_key' => (string) Str::uuid(), 'email' => 'brands@example.test', 'items' => $items,
        ])->assertCreated();

        // One brand, however many lines or units: a single fee.
        $one = $checkout([$line($dior1, 3), $line($dior2, 2)]);
        $one->assertJsonPath('data.delivery_cents', 1500)->assertJsonPath('data.payment_amount_cents', 40000 + 1500);

        // Two brands: two fees. Brands are compared exactly, so "dior" is a third one.
        $two = $checkout([$line($dior1), $line($dior2), $line($chanel)]);
        $two->assertJsonPath('data.delivery_cents', 3000)->assertJsonPath('data.payment_amount_cents', 17000 + 3000);
        $three = $checkout([$line($dior1), $line($chanel), $line($diorCase)]);
        $three->assertJsonPath('data.delivery_cents', 4500)->assertJsonPath('data.payment_amount_cents', 13000 + 4500);

        // Products without a brand share one bucket, like `new Set()` does for null in the storefront.
        $none = $checkout([$line($noBrand1), $line($noBrand2)]);
        $none->assertJsonPath('data.delivery_cents', 1500)->assertJsonPath('data.payment_amount_cents', 1000 + 1500);
        $mixed = $checkout([$line($noBrand1), $line($dior1)]);
        $mixed->assertJsonPath('data.delivery_cents', 3000);

        $stored = OrderCheckoutSession::findOrFail($three->json('data.id'));
        $this->assertSame(4500, $stored->delivery_cents);
        // Stripe is asked to charge goods plus a separate delivery line, summing to the stored total.
        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/checkout/sessions')
            && ($request->data()['line_items[3][price_data][unit_amount]'] ?? null) === 4500
            && ($request->data()['line_items[3][price_data][product_data][name]'] ?? null) === 'Delivery');

        // The payment is only accepted for the amount including delivery.
        $this->stripeEvent($stored, amount: 13000)->assertStatus(422);
        $this->assertDatabaseCount('orders', 0);
        $this->stripeEvent($stored)->assertOk();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_the_order_email_lists_delivery_so_the_total_adds_up(): void
    {
        [, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 1]], $cookie);
        $this->stripeEvent($checkout)->assertOk();
        $email = TransactionalEmail::where('template', 'order')->firstOrFail();

        Mail::fake();
        (new DeliverTransactionalEmail($email->id))->handle();
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail): bool {
            $mail->assertSeeInText('Delivery €15.00');
            $mail->assertSeeInText('Total paid €45.00');
            $mail->assertSeeInHtml('€15.00');

            return true;
        });
    }

    private function guestCheckout(array $items, ?string &$cookie = null, array $extra = []): OrderCheckoutSession
    {
        $response = $this->postJson('/api/orders', ['idempotency_key' => (string) Str::uuid(), 'email' => 'guest@example.test', 'items' => $items] + $extra)
            ->assertCreated();
        $cookie = $response->headers->getCookies()[0]->getValue();

        return OrderCheckoutSession::findOrFail($response->json('data.id'));
    }

    private function stripeEvent(
        OrderCheckoutSession $checkout,
        string $type = 'checkout.session.completed',
        string $paymentStatus = 'paid',
        ?string $eventId = null,
        ?int $amount = null,
        string $currency = 'eur',
        array $customerDetails = [],
    ): TestResponse {
        return $this->signedWebhook([
            'id' => $eventId ?? 'evt_'.Str::uuid(),
            'type' => $type,
            'data' => ['object' => [
                'id' => $checkout->stripe_checkout_session_id,
                'metadata' => ['order_checkout_session_id' => (string) $checkout->id],
                'payment_status' => $paymentStatus,
                'amount_total' => $amount ?? $checkout->payment_amount_cents,
                'currency' => $currency,
                'payment_intent' => 'pi_order_'.$checkout->id,
                'customer_details' => $customerDetails,
            ]],
        ]);
    }

    private function signedWebhook(array $event): TestResponse
    {
        $timestamp = time();
        $payload = json_encode($event, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_orders');

        return $this->postJson('/api/webhooks/stripe', $event, ['Stripe-Signature' => "t={$timestamp},v1={$signature}"]);
    }

    private function basket(User $user, GoodRegister $register, int $quantity): void
    {
        Basket::create([
            'user_id' => $user->id,
            'good_id' => $register->good_id,
            'color_id' => $register->color_id,
            'good_register_id' => $register->id,
            'quantity' => $quantity,
        ]);
    }

    /** @return array{Good, GoodRegister, GoodRegister, GoodRegister} */
    private function inventory(): array
    {
        $category = Category::create(['name' => 'Order category']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Order subcategory']);
        $red = Color::create(['name' => 'Red', 'hexcode' => '#ff0000']);
        $blue = Color::create(['name' => 'Blue', 'hexcode' => '#0000ff']);
        $good = Good::create([
            'name' => 'Order inventory', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id,
            'price' => '30.00', 'current_quantity' => 12, 'description' => 'Order stock', 'visible' => true,
        ]);
        $small = $good->inventory()->create(['color_id' => $red->id, 'size' => 'S', 'quantity' => 5]);
        $large = $good->inventory()->create(['color_id' => $red->id, 'size' => 'L', 'quantity' => 4]);
        $unsized = $good->inventory()->create(['color_id' => $blue->id, 'size' => null, 'quantity' => 3]);

        return [$good->fresh(), $small, $large, $unsized];
    }
}

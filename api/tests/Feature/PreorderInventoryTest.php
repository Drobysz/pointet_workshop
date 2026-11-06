<?php

namespace Tests\Feature;

use App\Models\Basket;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\PreorderCheckoutSession;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PreorderInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('checkout.mode', 'preorder');
        config()->set('services.stripe.secret', 'sk_test_inventory');
        config()->set('services.stripe.webhook_secret', 'whsec_inventory');

        $sessionNumber = 0;
        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => function () use (&$sessionNumber) {
                $sessionId = 'cs_test_inventory_'.++$sessionNumber;

                return Http::response(['id' => $sessionId, 'url' => 'https://checkout.stripe.test/'.$sessionId]);
            },
        ]);
    }

    public function test_paid_guest_preorder_deducts_only_selected_variants_and_updates_catalog_totals(): void
    {
        [$good, $small, $large, $blue] = $this->inventory();
        $version = $good->inventory_version;
        $checkout = $this->guestCheckout([
            ['inventory_id' => $small->id, 'quantity' => 2],
            ['inventory_id' => $blue->id, 'quantity' => 1],
        ]);

        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(12, $good->fresh()->current_quantity);
        $this->assertDatabaseCount('preorders', 0);

        $this->stripeEvent($checkout)->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(4, $large->fresh()->quantity);
        $this->assertSame(2, $blue->fresh()->quantity);
        $this->assertSame($version + 1, $good->fresh()->inventory_version);
        $this->getJson('/api/goods/'.$good->id)->assertOk()
            ->assertJsonPath('data.current_quantity', 9)
            ->assertJsonPath('data.inventory.0.quantity', 3)
            ->assertJsonPath('data.inventory.1.quantity', 4)
            ->assertJsonPath('data.inventory.2.quantity', 2);
        $this->assertDatabaseHas('preorder_registers', ['good_register_id' => $small->id, 'quantity' => 2]);
        $this->assertDatabaseHas('preorder_registers', ['good_register_id' => $blue->id, 'quantity' => 1]);
        // The email collected before payment remains available even when the
        // Stripe event does not include customer_details.
        $this->assertDatabaseHas('preorders', ['id' => $checkout->fresh()->preorder_id, 'customer_email' => 'guest@example.test']);
    }

    public function test_paid_authenticated_preorder_deducts_inventory_and_clears_basket(): void
    {
        [$good, $small] = $this->inventory();
        $user = User::factory()->create();
        $this->basket($user, $small, 2);
        $response = $this->withToken($this->accessToken($user))
            ->postJson('/api/preorders', ['idempotency_key' => (string) Str::uuid()])
            ->assertCreated();
        $checkout = PreorderCheckoutSession::findOrFail($response->json('data.id'));

        $this->assertSame(5, $small->fresh()->quantity);
        $this->stripeEvent($checkout)->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(10, $good->fresh()->current_quantity);
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);
        $this->assertDatabaseHas('preorders', ['user_id' => $user->id, 'payment_status' => 'paid']);
    }

    public function test_repeated_events_and_different_success_events_for_one_checkout_deduct_once(): void
    {
        [$good, $small] = $this->inventory();
        $version = $good->inventory_version;
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);

        $this->stripeEvent($checkout, eventId: 'evt_inventory_once')->assertOk();
        $this->stripeEvent($checkout, eventId: 'evt_inventory_once')->assertOk();
        $this->stripeEvent($checkout, type: 'checkout.session.async_payment_succeeded', eventId: 'evt_inventory_also_paid')->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(10, $good->fresh()->current_quantity);
        $this->assertSame($version + 1, $good->fresh()->inventory_version);
        $this->assertDatabaseCount('preorders', 1);
        $this->assertDatabaseCount('stripe_webhook_events', 2);
    }

    public function test_delayed_payment_deducts_stock_only_when_payment_succeeds(): void
    {
        [$good, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);

        $this->stripeEvent($checkout, paymentStatus: 'unpaid')->assertOk();
        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(12, $good->fresh()->current_quantity);
        $this->assertDatabaseCount('preorders', 0);

        $this->stripeEvent($checkout, type: 'checkout.session.async_payment_succeeded')->assertOk();
        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(10, $good->fresh()->current_quantity);
        $this->assertDatabaseCount('preorders', 1);
    }

    public function test_deleting_a_paid_preorder_does_not_allow_another_stock_deduction(): void
    {
        [$good, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);
        $this->stripeEvent($checkout)->assertOk();
        $checkout->fresh()->preorder->delete();
        $this->assertNull($checkout->fresh()->preorder_id);

        $this->stripeEvent($checkout, type: 'checkout.session.async_payment_succeeded')->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(10, $good->fresh()->current_quantity);
        $this->assertDatabaseCount('preorders', 0);
    }

    public function test_failed_and_cancelled_payments_do_not_deduct_inventory(): void
    {
        [$good, $small] = $this->inventory();
        $version = $good->inventory_version;

        foreach (['checkout.session.expired' => 'canceled', 'checkout.session.async_payment_failed' => 'failed'] as $type => $status) {
            $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);
            $this->stripeEvent($checkout, type: $type, paymentStatus: 'unpaid')->assertOk();
            $this->assertSame($status, $checkout->fresh()->payment_status->value);
        }

        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(12, $good->fresh()->current_quantity);
        $this->assertSame($version, $good->fresh()->inventory_version);
        $this->assertDatabaseCount('preorders', 0);
    }

    public function test_insufficient_stock_rolls_back_every_line_and_allows_retry_after_restock(): void
    {
        [$good, $small, $large] = $this->inventory();
        $checkout = $this->guestCheckout([
            ['inventory_id' => $small->id, 'quantity' => 2],
            ['inventory_id' => $large->id, 'quantity' => 4],
        ]);
        $competingCheckout = $this->guestCheckout([['inventory_id' => $large->id, 'quantity' => 1]]);
        $this->stripeEvent($competingCheckout)->assertOk();
        $version = $good->fresh()->inventory_version;

        $this->stripeEvent($checkout, eventId: 'evt_inventory_retry')->assertUnprocessable();

        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(3, $large->fresh()->quantity);
        $this->assertSame(11, $good->fresh()->current_quantity);
        $this->assertSame($version, $good->fresh()->inventory_version);
        $this->assertSame('pending', $checkout->fresh()->payment_status->value);
        $this->assertDatabaseCount('preorders', 1);
        $this->assertDatabaseMissing('stripe_webhook_events', ['stripe_event_id' => 'evt_inventory_retry']);

        $large->increment('quantity');
        $this->stripeEvent($checkout, eventId: 'evt_inventory_retry')->assertOk();

        $this->assertSame(3, $small->fresh()->quantity);
        $this->assertSame(0, $large->fresh()->quantity);
        $this->assertSame(6, $good->fresh()->current_quantity);
        $this->assertSame($version + 1, $good->fresh()->inventory_version);
        $this->assertDatabaseCount('preorders', 2);
    }

    public function test_invalid_payment_amount_does_not_deduct_inventory(): void
    {
        [$good, $small] = $this->inventory();
        $checkout = $this->guestCheckout([['inventory_id' => $small->id, 'quantity' => 2]]);

        $this->stripeEvent($checkout, amount: 200)->assertUnprocessable();

        $this->assertSame(5, $small->fresh()->quantity);
        $this->assertSame(12, $good->fresh()->current_quantity);
        $this->assertDatabaseCount('preorders', 0);
        $this->assertDatabaseCount('stripe_webhook_events', 0);
    }

    public function test_authenticated_checkout_rejects_a_basket_that_exceeds_current_stock(): void
    {
        [, $small] = $this->inventory();
        $user = User::factory()->create();
        $this->basket($user, $small, 3);
        $small->update(['quantity' => 2]);

        $this->withToken($this->accessToken($user))
            ->postJson('/api/preorders', ['idempotency_key' => (string) Str::uuid()])
            ->assertUnprocessable();

        $this->assertSame(2, $small->fresh()->quantity);
        $this->assertDatabaseCount('preorder_checkout_sessions', 0);
        Http::assertNothingSent();
    }

    private function guestCheckout(array $items): PreorderCheckoutSession
    {
        $response = $this->postJson('/api/preorders', ['idempotency_key' => (string) Str::uuid(), 'email' => 'guest@example.test', 'items' => $items])
            ->assertCreated();

        return PreorderCheckoutSession::findOrFail($response->json('data.id'));
    }

    private function stripeEvent(
        PreorderCheckoutSession $checkout,
        string $type = 'checkout.session.completed',
        string $paymentStatus = 'paid',
        ?string $eventId = null,
        int $amount = 100,
    ): TestResponse {
        $event = [
            'id' => $eventId ?? 'evt_'.Str::uuid(),
            'type' => $type,
            'data' => ['object' => [
                'id' => $checkout->stripe_checkout_session_id,
                'metadata' => ['preorder_checkout_session_id' => (string) $checkout->id],
                'payment_status' => $paymentStatus,
                'amount_total' => $amount,
                'currency' => 'eur',
                'payment_intent' => 'pi_inventory_'.$checkout->id,
            ]],
        ];
        $timestamp = time();
        $payload = json_encode($event, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_inventory');

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
        $category = Category::create(['name' => 'Inventory category']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Inventory subcategory']);
        $red = Color::create(['name' => 'Red', 'hexcode' => '#ff0000']);
        $blue = Color::create(['name' => 'Blue', 'hexcode' => '#0000ff']);
        $good = Good::create([
            'name' => 'Preorder inventory', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id,
            'price' => '30.00', 'current_quantity' => 12, 'description' => 'Preorder stock', 'visible' => true,
        ]);
        $small = $good->inventory()->create(['color_id' => $red->id, 'size' => 'S', 'quantity' => 5]);
        $large = $good->inventory()->create(['color_id' => $red->id, 'size' => 'L', 'quantity' => 4]);
        $unsized = $good->inventory()->create(['color_id' => $blue->id, 'size' => null, 'quantity' => 3]);

        return [$good->fresh(), $small, $large, $unsized];
    }
}

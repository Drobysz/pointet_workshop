<?php

namespace Tests\Feature;

use App\Mail\TransactionalMail;
use App\Models\SellerApplication;
use App\Models\TransactionalEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SellerApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_application_is_validated_and_admin_can_review_it_once(): void
    {
        Mail::fake();
        $payload = $this->payload();
        $this->postJson('/api/seller/requests', [...$payload, 'email' => 'invalid'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
        $created = $this->postJson('/api/seller/requests', $payload)
            ->assertCreated()
            ->assertJsonPath('data.status', 'processing');
        $applicationId = $created->json('data.id');
        $customer = User::factory()->create();
        $this->withToken($this->accessToken($customer))
            ->postJson("/api/seller/requests/{$applicationId}/response", ['approved' => true, 'response' => 'Hello'])
            ->assertForbidden();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($this->accessToken($admin))
            ->postJson("/api/seller/requests/{$applicationId}/response", ['approved' => true, 'response' => 'Approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.response_message', 'Approved');
        $this->withToken($this->accessToken($admin))
            ->postJson("/api/seller/requests/{$applicationId}/response", ['approved' => false, 'response' => 'Changed mind'])
            ->assertStatus(409);
        $this->assertDatabaseHas('seller_applications', ['id' => $applicationId, 'reviewed_by' => $admin->id]);
        $this->flushHeaders()->postJson('/api/seller/requests', $payload)->assertCreated()
            ->assertJsonPath('data.id', $applicationId)
            ->assertJsonPath('data.status', 'processing')
            ->assertJsonPath('data.reviewed_at', null)
            ->assertJsonPath('data.response_message', null);
        $this->assertDatabaseCount('seller_applications', 1);
        $this->assertDatabaseCount('transactional_emails', 1);
    }

    public function test_seller_confirmation_uses_english_and_is_sent_once_per_submission(): void
    {
        Mail::fake();
        app()->setLocale('fr');
        $payload = $this->payload();
        $this->postJson('/api/seller/requests', [...$payload, 'email' => 'invalid'])->assertUnprocessable();
        $this->assertDatabaseCount('transactional_emails', 0);

        $applicationId = $this->postJson('/api/seller/requests', $payload)->assertCreated()->json('data.id');
        $this->postJson('/api/seller/requests', [...$payload, 'email' => strtoupper($payload['email'])])
            ->assertCreated()->assertJsonPath('data.id', $applicationId);

        $this->assertDatabaseCount('seller_applications', 1);
        $this->assertDatabaseCount('transactional_emails', 1);
        Mail::assertNothingOutgoing();
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();

        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($payload): bool {
            $mail->assertHasSubject('We Received Your Seller Application — Pointet');
            $mail->assertSeeInText('contact you shortly');

            return $mail->locale === 'en' && $mail->hasTo($payload['email']);
        });
        Mail::assertSentCount(1);
        $this->assertNotNull(TransactionalEmail::firstOrFail()->sent_at);
        $this->assertNull(TransactionalEmail::firstOrFail()->payload);
    }

    public function test_only_admins_can_list_seller_applications(): void
    {
        SellerApplication::create($this->payload());
        $this->getJson('/api/seller/requests')->assertUnauthorized();
        $this->withToken($this->accessToken(User::factory()->create()))->getJson('/api/seller/requests')->assertForbidden();
        $this->withToken($this->accessToken(User::factory()->create(['role' => 'admin'])))
            ->getJson('/api/seller/requests?status=processing')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    private function payload(): array
    {
        return [
            'first_name' => 'Anna', 'last_name' => 'Brand', 'tel_number' => '+33612345678',
            'country' => 'France', 'email' => 'brand@example.test', 'brand_name' => 'Studio Anna',
            'company_address' => '1 rue de Paris, Paris', 'description_of_contact' => 'Email is best.',
            'description_of_brand' => 'Independent clothing studio.', 'is_resident_of_eu' => true,
        ];
    }
}

<?php

namespace Tests\Feature;

use App\Models\SellerApplication;
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

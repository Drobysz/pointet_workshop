<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Good;
use App\Models\Preorder;
use App\Models\PreorderRegister;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreorderAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_counts_only_paid_preorder_quantities_and_keeps_zero_products(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create();
        $category = Category::create(['name' => 'Clothes']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Tops']);
        $popular = $this->good($category->id, $subcategory->id, 'Popular', '20.00');
        $zero = $this->good($category->id, $subcategory->id, 'Zero', '30.00');
        $this->register($customer, $popular, 'paid', 3);
        $this->register($customer, $popular, 'paid', 4);
        $this->register($customer, $popular, 'pending', 99);
        $this->register($customer, $popular, 'refunded', 99);

        $this->withToken($this->accessToken($admin))
            ->getJson('/api/preorder/analytics?per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.product_id', $popular->id)
            ->assertJsonPath('data.0.preordered_quantity', 7)
            ->assertJsonPath('meta.total', 2);

        $this->withToken($this->accessToken($admin))
            ->getJson('/api/preorder/analytics?page=2&per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.product_id', $zero->id)
            ->assertJsonPath('data.0.preordered_quantity', 0);

        $this->withToken($this->accessToken($customer))
            ->getJson('/api/preorder/analytics')
            ->assertForbidden();
    }

    private function good(int $categoryId, int $subcategoryId, string $name, string $price): Good
    {
        return Good::create([
            'category_id' => $categoryId,
            'subcategory_id' => $subcategoryId,
            'name' => $name,
            'price' => $price,
            'description' => $name,
            'visible' => true,
        ]);
    }

    private function register(User $user, Good $good, string $status, int $quantity): void
    {
        $preorder = Preorder::create([
            'user_id' => $user->id,
            'customer_name' => $user->full_name,
            'customer_email' => $user->email,
            'payment_status' => $status,
            'payment_amount_cents' => 100,
            'currency' => 'eur',
            'idempotency_key' => (string) str()->uuid(),
        ]);
        PreorderRegister::create([
            'preorder_id' => $preorder->id,
            'good_id' => $good->id,
            'product_name' => $good->name,
            'original_unit_price' => $good->price,
            'quantity' => $quantity,
        ]);
    }
}

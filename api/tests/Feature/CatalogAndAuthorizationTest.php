<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Material;
use App\Models\Order;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_are_returned_as_a_complete_collection(): void
    {
        foreach (range(1, 55) as $index) {
            Category::create([
                'name' => "Category {$index}",
            ]);
        }

        $response = $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(55, 'data');

        $this->assertArrayNotHasKey('links', $response->json());
        $this->assertArrayNotHasKey('meta', $response->json());
    }

    public function test_goods_filters_pagination_and_color_image_structure(): void
    {
        // This fixture uses an externally hosted image rather than a private S3 object.
        config()->set('filesystems.disks.s3.signed_urls', false);
        [$category, $subcategory] = $this->catalogMarkers();
        $black = Color::create([
            'name' => 'Black',
            'hexcode' => '#000000',
        ]);
        $chair = $this->createGood(
            $category,
            $subcategory,
            'Oak Chair',
            120,
        );
        $chair->colors()->attach($black);
        $chair->materials()->attach(Material::create(['name' => 'Oak'])->id);

        ProductImage::create([
            'good_id' => $chair->id,
            'color_id' => $black->id,
            'name' => 'Front',
            'path' => 'goods/1/black/front.webp',
            'url' => 'https://example.test/front.webp',
        ]);

        foreach (range(1, 8) as $index) {
            $this->createGood(
                $category,
                $subcategory,
                "Bag {$index}",
                20 + $index,
            );
        }

        $this->getJson('/api/goods?search=oak&min_price=100&max_price=130')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category.name', 'Home')
            ->assertJsonPath('data.0.subcategory.name', 'Furniture')
            ->assertJsonPath('data.0.materials.0.name', 'Oak')
            ->assertJsonPath('data.0.inventory.0.color_id', $black->id)
            ->assertJsonPath('data.0.colors.0.name', 'Black')
            ->assertJsonPath('data.0.colors.0.images.0.url', 'https://example.test/front.webp');

        $this->getJson('/api/goods?per_page=7')
            ->assertOk()
            ->assertJsonCount(7, 'data')
            ->assertJsonPath('meta.total', 9);

        $this->getJson("/api/goods/{$chair->id}")
            ->assertOk()
            ->assertJsonPath(
                'data.colors.0.images.0.url',
                'https://example.test/front.webp',
            );
    }

    public function test_admin_mutations_and_private_order_ownership_are_enforced(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->withToken($this->accessToken($user))
            ->postJson('/api/categories', ['name' => 'Furniture'])
            ->assertForbidden();

        $this->withToken($this->accessToken($admin))
            ->postJson('/api/categories', ['name' => 'Furniture'])
            ->assertCreated();

        $order = Order::create([
            'user_id' => $other->id,
            'customer_name' => $other->full_name,
            'customer_email' => $other->email,
            'status' => 'processing',
            'placed_at' => now(),
        ]);

        $this->withToken($this->accessToken($user))
            ->getJson("/api/orders/{$order->id}")
            ->assertForbidden();

        $this->withToken($this->accessToken($admin))
            ->getJson("/api/orders/{$order->id}")
            ->assertOk();
    }

    public function test_hidden_products_are_private_but_remain_available_to_admins(): void
    {
        [$category, $subcategory] = $this->catalogMarkers();
        $hidden = $this->createGood(
            $category,
            $subcategory,
            'Hidden chair',
            85,
        );
        $hidden->update(['visible' => false]);

        $this->getJson('/api/goods?search=hidden')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->getJson("/api/goods/{$hidden->id}")
            ->assertNotFound();

        $customer = User::factory()->create();
        $this->withToken($this->accessToken($customer))
            ->getJson('/api/admin/goods')
            ->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($this->accessToken($admin))
            ->getJson('/api/admin/goods?search=hidden')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.visible', false);
        $this->withToken($this->accessToken($admin))
            ->getJson("/api/admin/goods/{$hidden->id}")
            ->assertOk()
            ->assertJsonPath('data.visible', false);
    }

    public function test_customer_and_admin_order_lists_are_not_paginated(): void
    {
        $customer = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        foreach (range(1, 8) as $index) {
            Order::create([
                'user_id' => $customer->id,
                'customer_name' => $customer->full_name,
                'customer_email' => $customer->email,
                'status' => 'processing',
                'placed_at' => now()->subMinutes($index),
            ]);
        }

        $customerResponse = $this->withToken($this->accessToken($customer))
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(8, 'data');
        $this->assertArrayNotHasKey('links', $customerResponse->json());
        $this->assertArrayNotHasKey('meta', $customerResponse->json());

        $adminResponse = $this->withToken($this->accessToken($admin))
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(8, 'data');
        $this->assertArrayNotHasKey('links', $adminResponse->json());
        $this->assertArrayNotHasKey('meta', $adminResponse->json());
    }

    public function test_only_an_admin_can_create_a_verified_customer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $payload = [
            'full_name' => 'Test Customer',
            'email' => 'customer@example.test',
            'address' => '10 Customer Street',
            'tel' => null,
            'language' => 'it',
            'password' => 'customer123',
        ];

        $this->withToken($this->accessToken($user))
            ->postJson('/api/users', $payload)
            ->assertForbidden();

        $this->withToken($this->accessToken($admin))
            ->postJson('/api/users', $payload)
            ->assertCreated()
            ->assertJsonPath('data.role', 'user')
            ->assertJsonPath('data.email', 'customer@example.test')
            ->assertJsonPath('data.language', 'it')
            ->assertJsonMissingPath('data.avatar_url');

        $createdUser = User::query()
            ->where('email', 'customer@example.test')
            ->firstOrFail();

        $this->assertNotNull($createdUser->email_verified_at);
    }

    private function catalogMarkers(): array
    {
        $category = Category::create(['name' => 'Home']);
        $subcategory = Subcategory::create([
            'name' => 'Furniture',
            'category_id' => $category->id,
        ]);

        return [$category, $subcategory];
    }

    private function createGood(
        Category $category,
        Subcategory $subcategory,
        string $name,
        int $price,
    ): Good {
        return Good::create([
            'name' => $name,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'price' => $price,
            'current_quantity' => 8,
            'description' => "Description for {$name}",
        ]);
    }
}

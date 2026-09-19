<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Order;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

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
            ->assertJsonPath('data.0.subcategory.name', 'Furniture')
            ->assertJsonPath('data.0.colors.0.name', 'Black');

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

    public function test_only_an_admin_can_create_a_verified_customer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $payload = [
            'full_name' => 'Test Customer',
            'email' => 'customer@example.test',
            'password' => 'customer123',
            'avatar_url' => null,
        ];

        $this->withToken($this->accessToken($user))
            ->postJson('/api/users', $payload)
            ->assertForbidden();

        $this->withToken($this->accessToken($admin))
            ->postJson('/api/users', $payload)
            ->assertCreated()
            ->assertJsonPath('data.role', 'user')
            ->assertJsonPath('data.email', 'customer@example.test');

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

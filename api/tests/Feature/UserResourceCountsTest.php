<?php

namespace Tests\Feature;

use App\Models\Basket;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Order;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserResourceCountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_resources_include_order_and_basket_goods_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::create(['name' => 'Furniture']);
        $subcategory = Subcategory::create(['name' => 'Chairs', 'category_id' => $category->id]);
        $color = Color::create(['name' => 'Black', 'hexcode' => '#000000']);
        $good = Good::create([
            'name' => 'Chair',
            'brand' => 'Atelier Nord',
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'price' => 100,
            'current_quantity' => 2,
            'description' => 'Oak chair',
        ]);
        $firstVariant = $good->inventory()->create(['color_id' => $color->id, 'quantity' => 1]);
        $secondVariant = $good->inventory()->create(['color_id' => $color->id, 'size' => 'Large', 'quantity' => 1]);

        foreach (range(1, 2) as $index) {
            Order::create([
                'user_id' => $user->id,
                'customer_name' => $user->full_name,
                'customer_email' => $user->email,
                'status' => 'processing',
                'placed_at' => now()->subMinutes($index),
            ]);
        }
        Order::create([
            'user_id' => $otherUser->id,
            'customer_name' => $otherUser->full_name,
            'customer_email' => $otherUser->email,
            'status' => 'processing',
            'placed_at' => now(),
        ]);
        Basket::create(['user_id' => $user->id, 'good_id' => $good->id, 'color_id' => $color->id, 'good_register_id' => $firstVariant->id, 'quantity' => 2]);
        Basket::create(['user_id' => $user->id, 'good_id' => $good->id, 'color_id' => $color->id, 'good_register_id' => $secondVariant->id, 'quantity' => 3]);

        $this->withToken($this->accessToken($admin))
            ->getJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('data.orders_count', 2)
            ->assertJsonPath('data.basket_goods_count', 5);

        $this->withToken($this->accessToken($admin))
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $user->id,
                'orders_count' => 2,
                'basket_goods_count' => 5,
            ]);
    }
}

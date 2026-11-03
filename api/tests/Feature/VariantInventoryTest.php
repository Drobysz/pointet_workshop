<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VariantInventoryTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        $this->withToken($this->accessToken(User::factory()->create(['role' => 'admin'])));
        $category = Category::create(['name' => 'Clothing']);
        $subcategory = Subcategory::create(['name' => 'Shirts', 'category_id' => $category->id]);
        $red = Color::create(['name' => 'Red', 'hexcode' => '#ff0000']);
        $blue = Color::create(['name' => 'Blue', 'hexcode' => '#0000ff']);

        return ['name' => 'Shirt', 'brand' => 'Atelier Nord', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id, 'price' => '25.50', 'description' => 'Cotton shirt', 'material_ids' => [], 'inventory' => [
            ['color_id' => $red->id, 'size' => 'XL', 'quantity' => 3],
            ['color_id' => $red->id, 'size' => '43.5', 'quantity' => 2],
            ['color_id' => $blue->id, 'size' => null, 'quantity' => 4],
        ]];
    }

    public function test_product_inventory_has_custom_sizes_distinct_colors_and_derived_total(): void
    {
        $data = $this->payload();
        $created = $this->postJson('/api/goods', $data)->assertCreated()->assertJsonPath('data.brand', 'Atelier Nord')->assertJsonPath('data.current_quantity', 9)->assertJsonCount(3, 'data.inventory')->assertJsonCount(2, 'data.colors');
        $id = $created->json('data.id');
        $this->getJson('/api/goods')->assertOk()->assertJsonCount(2, 'data.0.colors')->assertJsonPath('data.0.inventory.1.size', '43.5');
        $rows = $created->json('data.inventory');
        $data['inventory'] = array_map(fn ($row) => array_intersect_key($row, array_flip(['id', 'color_id', 'size', 'quantity'])), $rows);
        $data['inventory_version'] = $created->json('data.inventory_version');
        $data['inventory'][0]['quantity'] = 6;
        $this->putJson("/api/goods/{$id}", $data)->assertOk()->assertJsonPath('data.current_quantity', 12)->assertJsonPath('data.inventory.0.id', $rows[0]['id']);
        $this->putJson("/api/goods/{$id}", $data)->assertConflict();
    }

    public function test_invalid_duplicate_and_negative_inventory_is_rejected_without_writes(): void
    {
        $data = $this->payload();
        $data['inventory'][1]['size'] = ' xl ';
        $this->postJson('/api/goods', $data)->assertUnprocessable()->assertJsonValidationErrors('inventory.1.size');
        $data['inventory'][1]['size'] = 'L';
        $data['inventory'][1]['quantity'] = -1;
        $this->postJson('/api/goods', $data)->assertUnprocessable();
        $data['inventory'][1]['quantity'] = 2;
        $data['inventory'][0]['quantity'] = 2147483647;
        $this->postJson('/api/goods', $data)->assertUnprocessable();
        $this->assertDatabaseCount('goods', 0);
        $this->assertDatabaseCount('good_register', 0);
    }

    public function test_brand_is_required_when_creating_a_product(): void
    {
        $data = $this->payload();
        unset($data['brand']);

        $this->postJson('/api/goods', $data)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('brand');
    }

    public function test_null_size_is_unique_and_database_rejects_negative_stock(): void
    {
        $data = $this->payload();
        $data['inventory'][0]['size'] = null;
        $data['inventory'][1]['size'] = '   ';
        $this->postJson('/api/goods', $data)->assertUnprocessable();
        $data['inventory'][1]['size'] = 'XL';
        $created = $this->postJson('/api/goods', $data)->assertCreated();
        $row = Good::findOrFail($created->json('data.id'))->inventory()->first();
        $this->expectException(QueryException::class);
        $row->update(['quantity' => -1]);
    }

    public function test_restock_is_additive_scoped_and_invalidates_stale_product_edits(): void
    {
        $data = $this->payload();
        $created = $this->postJson('/api/goods', $data)->assertCreated();
        $id = $created->json('data.id');
        $row = $created->json('data.inventory.0.id');
        $this->postJson("/api/goods/{$id}/inventory/{$row}/restock", ['quantity' => 5])->assertOk()->assertJsonPath('data.inventory.0.quantity', 8)->assertJsonPath('data.current_quantity', 14);
        $this->postJson("/api/goods/{$id}/inventory/{$row}/restock", ['quantity' => 2])->assertOk()->assertJsonPath('data.inventory.0.quantity', 10);
        $this->postJson("/api/goods/{$id}/inventory/{$row}/restock", ['quantity' => 0])->assertUnprocessable();
        $this->postJson("/api/goods/{$id}/inventory/{$row}/restock", ['quantity' => 2147483647])->assertUnprocessable();
        $data['inventory_version'] = $created->json('data.inventory_version');
        $this->putJson("/api/goods/{$id}", $data)->assertConflict();
        $other = $this->postJson('/api/goods', $data)->assertCreated()->json('data.id');
        $this->postJson("/api/goods/{$other}/inventory/{$row}/restock", ['quantity' => 1])->assertNotFound();
        $this->withToken($this->accessToken(User::factory()->create()));
        $this->postJson("/api/goods/{$id}/inventory/{$row}/restock", ['quantity' => 1])->assertForbidden();
    }

    public function test_basket_and_checkout_use_exact_size_stock_and_snapshot_size(): void
    {
        $created = $this->postJson('/api/goods', $this->payload())->assertCreated();
        $small = $created->json('data.inventory.0.id');
        $large = $created->json('data.inventory.1.id');
        $selectedImage = ProductImage::create([
            'good_id' => $created->json('data.id'),
            'color_id' => $created->json('data.inventory.0.color_id'),
            'name' => 'Selected color',
            'path' => 'goods/selected-color.png',
        ]);
        $this->withToken($this->accessToken(User::factory()->create()));
        $this->postJson('/api/basket', ['good_register_id' => $small, 'quantity' => 4])->assertUnprocessable();
        $basket = $this->postJson('/api/basket', ['good_register_id' => $small, 'quantity' => 2])->assertCreated();
        $this->postJson('/api/basket', ['good_register_id' => $large, 'quantity' => 1])->assertCreated();
        $basketResponse = $this->getJson('/api/basket')->assertOk()->assertJsonCount(2, 'data');
        $this->assertArrayNotHasKey('links', $basketResponse->json());
        $this->assertArrayNotHasKey('meta', $basketResponse->json());
        $this->putJson('/api/basket/'.$basket->json('data.id'), ['quantity' => 4])->assertUnprocessable();
        $this->postJson('/api/orders', ['items' => [['good_register_id' => $small, 'quantity' => 2]]])
            ->assertCreated()
            ->assertJsonPath('data.items.0.size', 'XL')
            ->assertJsonPath('data.items.0.color_name', 'Red')
            ->assertJsonPath('data.items.0.images.0.id', $selectedImage->id);
        $this->assertDatabaseHas('good_register', ['id' => $small, 'quantity' => 1]);
        $this->assertDatabaseHas('good_register', ['id' => $large, 'quantity' => 2]);
        $this->assertDatabaseHas('goods', ['id' => $created->json('data.id'), 'current_quantity' => 7]);
        $this->assertDatabaseCount('baskets', 0);
        $this->postJson('/api/orders', ['items' => [['good_register_id' => $small, 'quantity' => 2]]])->assertUnprocessable();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_customer_can_clear_the_entire_basket(): void
    {
        $created = $this->postJson('/api/goods', $this->payload())->assertCreated();
        $user = User::factory()->create();
        $this->withToken($this->accessToken($user));
        $this->postJson('/api/basket', ['good_register_id' => $created->json('data.inventory.0.id'), 'quantity' => 1])->assertCreated();
        $this->postJson('/api/basket', ['good_register_id' => $created->json('data.inventory.1.id'), 'quantity' => 1])->assertCreated();

        $this->deleteJson('/api/basket')->assertNoContent();
        $this->assertDatabaseMissing('baskets', ['user_id' => $user->id]);
    }

    public function test_basket_images_are_scoped_to_product_and_selected_color(): void
    {
        $data = $this->payload();
        $created = $this->postJson('/api/goods', $data)->assertCreated();
        $other = $this->postJson('/api/goods', $data)->assertCreated();
        $goodId = $created->json('data.id');
        $red = $data['inventory'][0]['color_id'];
        $blue = $data['inventory'][2]['color_id'];
        $back = ProductImage::create(['good_id' => $goodId, 'color_id' => $red, 'name' => 'Back', 'path' => 'goods/back.png', 'sort_order' => 2]);
        $front = ProductImage::create(['good_id' => $goodId, 'color_id' => $red, 'name' => 'Front', 'path' => 'goods/front.png', 'sort_order' => 1]);
        ProductImage::create(['good_id' => $goodId, 'color_id' => $blue, 'name' => 'Blue', 'path' => 'goods/blue.png']);
        ProductImage::create(['good_id' => $other->json('data.id'), 'color_id' => $red, 'name' => 'Other', 'path' => 'goods/other.png']);
        $this->withToken($this->accessToken(User::factory()->create()));

        $basket = $this->postJson('/api/basket', ['good_register_id' => $created->json('data.inventory.0.id'), 'quantity' => 1])
            ->assertCreated()->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.id', $front->id)
            ->assertJsonPath('data.images.1.id', $back->id);
        $this->getJson('/api/basket')->assertOk()->assertJsonCount(2, 'data.0.images')->assertJsonPath('data.0.images.0.id', $front->id);
        $this->putJson('/api/basket/'.$basket->json('data.id'), ['quantity' => 2])
            ->assertOk()->assertJsonCount(2, 'data.images')->assertJsonPath('data.images.0.id', $front->id);
        $this->postJson('/api/basket', ['good_register_id' => $other->json('data.inventory.2.id'), 'quantity' => 1])
            ->assertCreated()->assertJsonPath('data.images', []);
    }

    public function test_adding_an_existing_basket_variant_cannot_exceed_its_stock(): void
    {
        $created = $this->postJson('/api/goods', $this->payload())->assertCreated();
        $variant = $created->json('data.inventory.0.id');
        $this->withToken($this->accessToken(User::factory()->create()));

        $this->postJson('/api/basket', ['good_register_id' => $variant, 'quantity' => 2])
            ->assertCreated()
            ->assertJsonPath('data.quantity', 2);
        $this->postJson('/api/basket', ['good_register_id' => $variant, 'quantity' => 1])
            ->assertOk()
            ->assertJsonPath('data.quantity', 3);
        $this->postJson('/api/basket', ['good_register_id' => $variant, 'quantity' => 1])
            ->assertUnprocessable()
            ->assertJsonPath('error.message', 'The requested quantity exceeds available stock for this product option.');

        $this->assertDatabaseHas('baskets', ['good_register_id' => $variant, 'quantity' => 3]);
    }

    public function test_duplicate_order_lines_cannot_oversell_and_roll_back_the_whole_order(): void
    {
        $created = $this->postJson('/api/goods', $this->payload())->assertCreated();
        $row = $created->json('data.inventory.0.id');
        $this->postJson('/api/orders', ['items' => [['good_register_id' => $row, 'quantity' => 2], ['good_register_id' => $row, 'quantity' => 2]]])->assertUnprocessable();
        $this->assertDatabaseHas('good_register', ['id' => $row, 'quantity' => 3]);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
    }

    public function test_removing_last_color_with_images_is_blocked_and_existing_row_identity_is_immutable(): void
    {
        $data = $this->payload();
        $created = $this->postJson('/api/goods', $data)->assertCreated();
        $id = $created->json('data.id');
        ProductImage::create(['good_id' => $id, 'color_id' => $data['inventory'][0]['color_id'], 'name' => 'Front', 'path' => 'goods/front.png']);
        $data['inventory_version'] = $created->json('data.inventory_version');
        $rows = array_map(fn ($row) => array_intersect_key($row, array_flip(['id', 'color_id', 'size', 'quantity'])), $created->json('data.inventory'));
        $data['inventory'] = [$rows[2]];
        $this->putJson("/api/goods/{$id}", $data)->assertConflict();
        $data['inventory'] = $rows;
        $data['inventory'][0]['size'] = 'XXL';
        $this->putJson("/api/goods/{$id}", $data)->assertUnprocessable();
        $this->assertDatabaseCount('good_register', 3);
    }
}

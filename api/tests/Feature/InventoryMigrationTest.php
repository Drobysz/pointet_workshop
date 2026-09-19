<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class InventoryMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_stock_images_and_baskets_survive_migration_and_rollback(): void
    {
        $migration = require database_path('migrations/2026_09_19_010000_create_good_register.php');
        $migration->down();
        $category = DB::table('categories')->insertGetId(['name' => 'Legacy']);
        $sub = DB::table('subcategories')->insertGetId(['name' => 'Legacy', 'category_id' => $category]);
        $red = DB::table('colors')->insertGetId(['name' => 'Red', 'hexcode' => '#ff0000']);
        $blue = DB::table('colors')->insertGetId(['name' => 'Blue', 'hexcode' => '#0000ff']);
        $user = DB::table('users')->insertGetId(['email' => 'legacy@example.test', 'full_name' => 'Legacy customer', 'password' => 'unused']);
        $base = ['category_id' => $category, 'subcategory_id' => $sub, 'price' => 20, 'description' => 'Legacy product'];
        $multi = DB::table('goods')->insertGetId($base + ['name' => 'Several colors', 'current_quantity' => 9]);
        $single = DB::table('goods')->insertGetId($base + ['name' => 'One color', 'current_quantity' => 3]);
        $noColor = DB::table('goods')->insertGetId($base + ['name' => 'No color', 'current_quantity' => 5]);
        DB::table('color_good')->insert([['good_id' => $multi, 'color_id' => $red], ['good_id' => $multi, 'color_id' => $blue], ['good_id' => $single, 'color_id' => $red]]);
        DB::table('images')->insert(['good_id' => $multi, 'color_id' => $red, 'name' => 'Front', 'path' => 'goods/legacy.png']);
        $basket = DB::table('baskets')->insertGetId(['user_id' => $user, 'good_id' => $single, 'color_id' => $red, 'quantity' => 2]);
        $migration->up();
        $unassigned = DB::table('colors')->where('name', 'Unassigned stock')->value('id');
        $this->assertDatabaseHas('good_register', ['good_id' => $multi, 'color_id' => $unassigned, 'quantity' => 9]);
        $this->assertDatabaseHas('good_register', ['good_id' => $multi, 'color_id' => $red, 'quantity' => 0]);
        $this->assertDatabaseHas('good_register', ['good_id' => $single, 'color_id' => $red, 'quantity' => 3]);
        $this->assertDatabaseHas('good_register', ['good_id' => $noColor, 'color_id' => $unassigned, 'quantity' => 5]);
        $this->assertSame(17, (int) DB::table('good_register')->sum('quantity'));
        $this->assertNotNull(DB::table('baskets')->where('id', $basket)->value('good_register_id'));
        $this->assertDatabaseCount('images', 1);
        $this->assertFalse(Schema::hasTable('color_good'));
        $migration->down();
        $this->assertTrue(Schema::hasTable('color_good'));
        $this->assertFalse(Schema::hasTable('good_register'));
        $this->assertSame(17, (int) DB::table('goods')->sum('current_quantity'));
        $this->assertDatabaseCount('images', 1);
        $migration->up();
    }
}

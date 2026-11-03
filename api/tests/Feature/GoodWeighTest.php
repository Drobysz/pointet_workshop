<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoodWeighTest extends TestCase
{
    use RefreshDatabase;

    public function test_weigh_defaults_to_zero_and_is_returned_by_the_catalog_api(): void
    {
        $response = $this->postJson('/api/goods', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.weigh', 0);

        $good = Good::findOrFail($response->json('data.id'));

        $this->assertSame(0, $good->weigh);
        $this->getJson("/api/goods/{$good->id}")
            ->assertOk()
            ->assertJsonPath('data.weigh', 0);
    }

    public function test_weigh_is_a_non_negative_integer_and_can_be_updated(): void
    {
        $payload = $this->payload();
        $payload['weigh'] = 750;
        $created = $this->postJson('/api/goods', $payload)
            ->assertCreated()
            ->assertJsonPath('data.weigh', 750);

        $id = $created->json('data.id');
        $payload['weigh'] = 1250;
        $payload['inventory_version'] = $created->json('data.inventory_version');
        $payload['inventory'] = array_map(
            fn (array $row) => array_intersect_key($row, array_flip(['id', 'color_id', 'size', 'quantity'])),
            $created->json('data.inventory'),
        );

        $this->putJson("/api/goods/{$id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.weigh', 1250);
        $this->assertDatabaseHas('goods', ['id' => $id, 'weigh' => 1250]);

        $invalid = $this->payload('invalid');
        $invalid['weigh'] = 1.5;
        $this->postJson('/api/goods', $invalid)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('weigh');
    }

    private function payload(string $suffix = ''): array
    {
        $this->withToken($this->accessToken(User::factory()->create(['role' => 'admin'])));
        $category = Category::create(['name' => "Home {$suffix}"]);
        $subcategory = Subcategory::create(['name' => "Furniture {$suffix}", 'category_id' => $category->id]);
        $color = Color::create(['name' => "Oak {$suffix}", 'hexcode' => '#A47C48']);

        return [
            'name' => 'Oak Chair',
            'brand' => 'Atelier Nord',
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'price' => '125.00',
            'description' => 'Restored oak chair.',
            'material_ids' => [],
            'inventory' => [[
                'color_id' => $color->id,
                'size' => null,
                'quantity' => 1,
            ]],
        ];
    }
}

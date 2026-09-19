<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryImage;
use App\Models\Color;
use App\Models\Good;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryImageUploadTest extends TestCase
{
    use RefreshDatabase;

    private function image(string $name = 'cover.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='));
    }

    private function signInAdmin(): void
    {
        Storage::fake('s3');
        $this->withToken($this->accessToken(User::factory()->create(['role' => 'admin'])));
    }

    public function test_category_image_is_stored_and_exposed_with_its_foreign_key(): void
    {
        $this->signInAdmin();
        $response = $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertCreated();
        $category = Category::firstOrFail();
        $image = CategoryImage::firstOrFail();
        $this->assertEquals($image->id, $category->image_id);
        $this->assertStringStartsWith("categories/{$category->id}/", $image->path);
        Storage::disk('s3')->assertExists($image->path);
        $response->assertJsonPath('data.image.id', $image->id)->assertJsonPath('data.image_id', $image->id);
        $this->getJson('/api/categories')->assertJsonPath('data.0.image.path', $image->path);
    }

    public function test_private_cover_urls_are_signed_at_read_time(): void
    {
        $this->signInAdmin();
        config()->set('filesystems.disks.s3.bucket', 'test-bucket');
        Storage::disk('s3')->buildTemporaryUrlsUsing(fn ($path, $expires) => 'https://images.example.test/'.$path.'?expires='.$expires->getTimestamp());
        $response = $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertCreated();
        $this->assertStringContainsString('?expires=', $response->json('data.image.url'));
        $this->assertStringNotContainsString('?expires=', CategoryImage::firstOrFail()->url);
    }

    public function test_replacing_and_removing_a_category_cover_cleans_up_old_files(): void
    {
        $this->signInAdmin();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertCreated();
        $category = Category::firstOrFail();
        $old = $category->image;
        $this->post('/api/categories/'.$category->id, ['_method' => 'PUT', 'name' => 'Furniture', 'image' => $this->image('replacement.png')], ['Accept' => 'application/json'])->assertOk();
        $new = $category->fresh()->image;
        $this->assertNotEquals($old->id, $new->id);
        Storage::disk('s3')->assertMissing($old->path);
        Storage::disk('s3')->assertExists($new->path);
        $this->assertDatabaseMissing('category_images', ['id' => $old->id]);
        $this->putJson('/api/categories/'.$category->id, ['name' => 'Furniture', 'remove_image' => true])->assertOk()->assertJsonPath('data.image', null)->assertJsonPath('data.image_id', null);
        Storage::disk('s3')->assertMissing($new->path);
        $this->assertDatabaseCount('category_images', 0);
    }

    public function test_category_upload_requires_admin_and_valid_image(): void
    {
        Storage::fake('s3');
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertUnauthorized();
        $this->withToken($this->accessToken(User::factory()->create()));
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertForbidden();
        $this->signInAdmin();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => UploadedFile::fake()->create('document.pdf', 1)])->assertUnprocessable();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()->size(10241)])->assertUnprocessable();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image(), 'remove_image' => true])->assertUnprocessable();
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_upload_failure_rolls_back_category_and_preserves_existing_cover(): void
    {
        $this->signInAdmin();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertCreated();
        $category = Category::firstOrFail();
        $old = $category->image;
        Storage::shouldReceive('disk')->with('s3')->andReturn($disk = \Mockery::mock());
        $disk->shouldReceive('putFileAs')->andThrow(new \RuntimeException('Storage unavailable'));
        $disk->shouldReceive('delete')->andReturn(true);
        $this->putJson('/api/categories/'.$category->id, ['name' => 'Updated', 'image' => $this->image()])->assertStatus(500);
        $this->assertEquals('Furniture', $category->fresh()->name);
        $this->assertEquals($old->id, $category->fresh()->image_id);
        $this->assertDatabaseCount('category_images', 1);
        $this->postJson('/api/categories', ['name' => 'New category', 'image' => $this->image()])->assertStatus(500);
        $this->assertDatabaseCount('categories', 1);
    }

    public function test_deleting_category_cleans_up_image_but_referenced_categories_keep_it(): void
    {
        $this->signInAdmin();
        $this->postJson('/api/categories', ['name' => 'Furniture', 'image' => $this->image()])->assertCreated();
        $category = Category::firstOrFail();
        $image = $category->image;
        $child = Subcategory::create(['category_id' => $category->id, 'name' => 'Chairs']);
        $this->deleteJson('/api/categories/'.$category->id)->assertStatus(500);
        Storage::disk('s3')->assertExists($image->path);
        $this->assertDatabaseHas('category_images', ['id' => $image->id]);
        $child->delete();
        $this->deleteJson('/api/categories/'.$category->id)->assertNoContent();
        Storage::disk('s3')->assertMissing($image->path);
        $this->assertDatabaseCount('category_images', 0);
    }

    public function test_product_uploads_are_assigned_to_an_existing_product_color(): void
    {
        $this->signInAdmin();
        $category = Category::create(['name' => 'Furniture']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Chairs']);
        $color = Color::create(['name' => 'Brown', 'hexcode' => '#654321']);
        $other = Color::create(['name' => 'White', 'hexcode' => '#ffffff']);
        $good = Good::create(['name' => 'Chair', 'category_id' => $category->id, 'subcategory_id' => $subcategory->id, 'price' => 20, 'current_quantity' => 2, 'description' => 'Oak chair']);
        $good->colors()->attach($color);
        $this->postJson("/api/goods/{$good->id}/images", ['color_id' => $other->id, 'image' => $this->image()])->assertUnprocessable();
        $upload = $this->postJson("/api/goods/{$good->id}/images", ['color_id' => $color->id, 'image' => $this->image()])->assertCreated();
        Storage::disk('s3')->assertExists($upload->json('data.path'));
        $this->getJson("/api/goods/{$good->id}")->assertJsonPath('data.colors.0.images.0.id', $upload->json('data.id'));
    }
}

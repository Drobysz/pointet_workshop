<?php

namespace Tests\Feature;

use App\Jobs\TranslateCatalogEntry;
use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Material;
use App\Models\Subcategory;
use App\Models\TranslationUsage;
use App\Models\User;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\Contracts\TranslationProvider;
use App\Services\Translation\TranslationUsageTracker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CatalogTranslationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('translation.deepl.api_key', 'test-key:fx');
        config()->set('translation.deepl.monthly_character_limit', 500000);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_product_names_are_translated_while_descriptions_stay_in_their_source_language(): void
    {
        $this->fakeDeepL();
        $response = $this->asAdmin('fr')
            ->postJson('/api/goods', $this->goodPayload('Veste en cuir', 'Veste en cuir véritable, fabriquée en France.'))
            ->assertCreated()
            ->assertJsonPath('data.name', 'Veste en cuir')
            ->assertJsonPath('data.source_locale', 'fr')
            ->assertJsonPath('data.translations.de.name', '[DE] Veste en cuir')
            ->assertJsonPath('data.translations.de.name_is_manual', false)
            ->assertJsonPath('data.translations.en.name', '[EN-GB] Veste en cuir')
            ->assertJsonMissingPath('data.translations.fr');
        $id = $response->json('data.id');

        $this->assertDatabaseCount('good_translations', 4);
        $this->assertDatabaseHas('good_translations', ['good_id' => $id, 'locale' => 'de', 'name' => '[DE] Veste en cuir', 'description' => null, 'short_description' => null, 'meta_title' => null, 'meta_description' => null]);
        // The fixture markers are translated too; the product itself costs exactly one request per target language.
        $productRequests = Http::recorded(fn (Request $request) => $request->data()['source_lang'] === 'FR');
        $this->assertCount(4, $productRequests);
        Http::assertNotSent(fn (Request $request) => str_contains(json_encode($request->data()), 'véritable'));
        foreach ($productRequests as [$request]) {
            $this->assertSame(['Veste en cuir'], $request->data()['text']);
            $this->assertSame('DeepL-Auth-Key test-key:fx', $request->header('Authorization')[0]);
            $this->assertStringStartsWith('https://api-free.deepl.com/v2/translate', $request->url());
        }

        // German storefront: localized name, original description.
        $this->withHeader('Accept-Language', 'de-DE,de;q=0.9,en;q=0.8')->getJson("/api/goods/{$id}")
            ->assertOk()
            ->assertJsonPath('data.name', '[DE] Veste en cuir')
            ->assertJsonPath('data.description', 'Veste en cuir véritable, fabriquée en France.')
            ->assertJsonMissingPath('data.translations');
        $this->getJson("/api/goods/{$id}?locale=it")->assertJsonPath('data.name', '[IT] Veste en cuir');
        $this->withHeader('Accept-Language', 'fr')->getJson("/api/goods/{$id}")->assertJsonPath('data.name', 'Veste en cuir');
        $this->withHeader('Accept-Language', 'de')->getJson('/api/goods?search=veste')->assertJsonCount(1, 'data');
        $this->withHeader('Accept-Language', 'de')->getJson('/api/goods?search=[de]')->assertJsonCount(1, 'data');
        $this->withHeader('Accept-Language', 'it')->getJson('/api/goods?search=[de]')->assertJsonCount(0, 'data');

        // Order and preorder snapshots keep the source name.
        $this->assertSame('Veste en cuir', Good::findOrFail($id)->name);
    }

    public function test_catalog_labels_use_the_universal_translations_table(): void
    {
        $this->fakeDeepL();
        $category = $this->asAdmin('en')->postJson('/api/categories', ['name' => 'Leather goods'])->assertCreated()
            ->assertJsonPath('data.source_locale', 'en')
            ->assertJsonPath('data.translations.fr.name', '[FR] Leather goods');
        $categoryId = $category->json('data.id');
        $this->asAdmin('en')->postJson('/api/subcategories', ['name' => 'Bags', 'category_id' => $categoryId])->assertCreated();
        $this->asAdmin('en')->postJson('/api/colors', ['name' => 'Black', 'hexcode' => '#000000'])->assertCreated();
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Oak'])->assertCreated();

        $this->assertDatabaseCount('translations', 16);
        $this->assertDatabaseCount('good_translations', 0);
        $this->assertDatabaseHas('translations', ['translatable_type' => 'color', 'field' => 'name', 'locale' => 'ru', 'value' => '[RU] Black', 'is_manual' => false]);

        $this->withHeader('Accept-Language', 'de')->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.name', '[DE] Leather goods')
            ->assertJsonPath('data.0.subcategories.0.name', '[DE] Bags')
            ->assertJsonMissingPath('data.0.translations');
        $this->withHeader('Accept-Language', 'ru')->getJson('/api/colors')->assertJsonPath('data.0.name', '[RU] Black');
        $this->withHeader('Accept-Language', 'it')->getJson('/api/materials')->assertJsonPath('data.0.name', '[IT] Oak');
        // Unsupported languages fall back to English, which is this material's source language.
        $this->withHeader('Accept-Language', 'ja')->getJson('/api/materials')->assertJsonPath('data.0.name', 'Oak');
        $this->withHeader('Accept-Language', 'ja')->getJson('/api/colors')->assertJsonPath('data.0.name', 'Black');

        // Administrators ask for the editable source labels plus every translation.
        $this->withHeader('Accept-Language', 'de')->getJson('/api/categories?include_translations=1')
            ->assertJsonPath('data.0.name', 'Leather goods')
            ->assertJsonPath('data.0.translations.de.name', '[DE] Leather goods')
            ->assertJsonPath('data.0.subcategories.0.translations.fr.name', '[FR] Bags');
    }

    public function test_source_locale_follows_the_admin_interface_locale_unless_overridden(): void
    {
        $this->fakeDeepL();
        $byInterface = $this->asAdmin('ru')->postJson('/api/colors', ['name' => 'Чёрный', 'hexcode' => '#000000'])
            ->assertCreated()->assertJsonPath('data.source_locale', 'ru')->assertJsonMissingPath('data.translations.ru');
        $overridden = $this->asAdmin('ru')->postJson('/api/colors', ['name' => 'Rosso', 'hexcode' => '#ff0000', 'source_locale' => 'it'])
            ->assertCreated()->assertJsonPath('data.source_locale', 'it')->assertJsonPath('data.translations.ru.name', '[RU] Rosso');
        $this->assertSame(['de', 'en', 'fr', 'it'], collect($byInterface->json('data.translations'))->keys()->sort()->values()->all());

        // Switching the interface language later does not move the record to another source language.
        $this->asAdmin('de')->putJson("/api/colors/{$overridden->json('data.id')}", ['name' => 'Rosso scuro', 'hexcode' => '#aa0000'])
            ->assertOk()->assertJsonPath('data.source_locale', 'it')->assertJsonPath('data.translations.de.name', '[DE] Rosso scuro');
        $this->asAdmin('de')->putJson("/api/colors/{$overridden->json('data.id')}", ['name' => 'Rosso scuro', 'hexcode' => '#aa0000', 'source_locale' => 'xx'])
            ->assertUnprocessable()->assertJsonValidationErrors('source_locale');
        $this->asAdmin('de')->postJson('/api/materials', ['name' => 'Lino', 'translations' => ['pt' => ['name' => 'Linho']]])
            ->assertUnprocessable()->assertJsonValidationErrors('translations');
        $this->asAdmin('de')->postJson('/api/materials', ['name' => 'Lino', 'translations' => ['fr' => ['description' => 'x']]])
            ->assertUnprocessable();
    }

    public function test_manual_translations_are_preserved_and_duplicate_requests_are_avoided(): void
    {
        $this->fakeDeepL();
        $material = $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Oak'])->assertCreated();
        $id = $material->json('data.id');
        Http::assertSentCount(4);

        // Identical source text is copied from the existing translation instead of being requested again.
        $this->asAdmin('en')->postJson('/api/categories', ['name' => 'Oak'])->assertCreated()->assertJsonPath('data.translations.de.name', '[DE] Oak');
        Http::assertSentCount(4);

        // Re-running the job with nothing pending sends nothing.
        TranslateCatalogEntry::dispatchSync('material', $id);
        Http::assertSentCount(4);

        // A manual German translation survives a rename; the other locales are regenerated.
        $this->asAdmin('en')->putJson("/api/materials/{$id}", ['name' => 'Oak', 'translations' => ['de' => ['name' => 'Eiche (geprüft)']]])
            ->assertOk()->assertJsonPath('data.translations.de.name', 'Eiche (geprüft)')->assertJsonPath('data.translations.de.name_is_manual', true);
        Http::assertSentCount(4);
        $this->asAdmin('en')->putJson("/api/materials/{$id}", ['name' => 'Oak wood'])
            ->assertOk()
            ->assertJsonPath('data.translations.de.name', 'Eiche (geprüft)')
            ->assertJsonPath('data.translations.de.name_is_stale', false)
            ->assertJsonPath('data.translations.fr.name', '[FR] Oak wood');
        Http::assertSentCount(7);
        $this->withHeader('Accept-Language', 'de')->getJson('/api/materials')->assertJsonPath('data.0.name', 'Eiche (geprüft)');

        // Clearing the manual value hands the locale back to automatic translation.
        $this->asAdmin('en')->putJson("/api/materials/{$id}", ['name' => 'Oak wood', 'translations' => ['de' => ['name' => null]]])
            ->assertOk()->assertJsonPath('data.translations.de.name', '[DE] Oak wood')->assertJsonPath('data.translations.de.name_is_manual', false);
        Http::assertSentCount(8);

        // Forced regeneration keeps manual values and only re-requests automatic ones.
        $this->asAdmin('en')->putJson("/api/materials/{$id}", ['name' => 'Oak wood', 'translations' => ['it' => ['name' => 'Rovere']]])->assertOk();
        $this->asAdmin('en')->postJson("/api/translations/materials/{$id}/regenerate")->assertStatus(202);
        Http::assertSentCount(11);
        $this->withHeader('Accept-Language', 'it')->getJson('/api/materials')->assertJsonPath('data.0.name', 'Rovere');
    }

    public function test_exhausted_quota_pauses_translation_without_breaking_catalog_writes(): void
    {
        Http::fake(['*.deepl.com/*' => Http::response(['message' => 'Quota Exceeded'], 456)]);

        $this->asAdmin('en')->postJson('/api/colors', ['name' => 'Black', 'hexcode' => '#000000'])->assertCreated()
            ->assertJsonPath('data.translations.de.name', null);
        Http::assertSentCount(1);
        $this->assertNotNull(TranslationUsage::query()->firstOrFail()->exhausted_at);

        // No further requests are attempted while the period is exhausted.
        $this->asAdmin('en')->postJson('/api/colors', ['name' => 'White', 'hexcode' => '#ffffff'])->assertCreated();
        $this->artisan('translations:sync')->assertSuccessful();
        Http::assertSentCount(1);
        $this->withHeader('Accept-Language', 'de')->getJson('/api/colors')->assertJsonPath('data.0.name', 'Black');
        $this->asAdmin('en')->getJson('/api/translations/usage')
            ->assertOk()->assertJsonPath('data.enabled', true)->assertJsonPath('data.exhausted', true)->assertJsonPath('data.provider', 'deepl');
        $this->withToken($this->accessToken(User::factory()->create()))->getJson('/api/translations/usage')->assertForbidden();
    }

    public function test_usage_is_tracked_locally_and_stops_before_the_plan_limit(): void
    {
        $this->fakeDeepL();
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Oak'])->assertCreated();
        $this->assertDatabaseHas('translation_usage', ['provider' => 'deepl', 'period' => now()->format('Y-m'), 'characters' => 12, 'character_limit' => 500000]);

        config()->set('translation.deepl.monthly_character_limit', 14);
        $this->resetTranslationServices();
        TranslationUsage::query()->update(['character_limit' => 14]);
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Walnut'])->assertCreated()->assertJsonPath('data.translations.de.name', null);
        Http::assertSentCount(4);
        $this->assertNotNull(TranslationUsage::query()->firstOrFail()->exhausted_at);
    }

    public function test_codes_and_identifiers_are_never_sent_for_translation(): void
    {
        $this->fakeDeepL();
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'AB-1234'])->assertCreated();
        $this->asAdmin('en')->postJson('/api/colors', ['name' => '9005', 'hexcode' => '#000000'])->assertCreated();
        Http::assertNothingSent();
        $this->withHeader('Accept-Language', 'de')->getJson('/api/materials')->assertJsonPath('data.0.name', 'AB-1234');
    }

    public function test_pending_labels_are_translated_in_batches_by_the_sync_command(): void
    {
        $this->fakeDeepL();
        config()->set('translation.deepl.api_key', null);
        $this->resetTranslationServices();
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Oak'])->assertCreated();
        $this->asAdmin('en')->postJson('/api/materials', ['name' => 'Linen'])->assertCreated();
        $this->asAdmin('en')->postJson('/api/colors', ['name' => 'Black', 'hexcode' => '#000000'])->assertCreated();
        Http::assertNothingSent();
        $this->assertDatabaseCount('translations', 0);
        $this->asAdmin('en')->getJson('/api/translations/usage')->assertJsonPath('data.enabled', false);

        config()->set('translation.deepl.api_key', 'test-key:fx');
        $this->resetTranslationServices();
        $this->artisan('translations:sync', ['--type' => ['materials', 'colors']])->assertSuccessful();
        // One request per target language for all materials, then one per language for the colors.
        Http::assertSentCount(8);
        $this->assertDatabaseCount('translations', 12);
        Http::assertSent(fn (Request $request) => $request->data()['text'] === ['Oak', 'Linen']);
        $this->withHeader('Accept-Language', 'fr')->getJson('/api/materials?search=linen')->assertJsonPath('data.0.name', '[FR] Linen');
    }

    public function test_good_translations_are_removed_with_the_product_and_are_never_description_translations(): void
    {
        $this->fakeDeepL();
        $id = $this->asAdmin('en')->postJson('/api/goods', $this->goodPayload('Leather jacket', 'Genuine leather jacket.'))->assertCreated()->json('data.id');
        $this->assertSame(0, Good::findOrFail($id)->translations()->whereNotNull('description')->count());

        $this->asAdmin('en')->putJson("/api/goods/{$id}", [
            ...$this->goodPayload('Leather jacket', 'Genuine leather jacket.'),
            'inventory_version' => Good::findOrFail($id)->inventory_version,
            'inventory' => Good::findOrFail($id)->inventory->map(fn ($row) => ['id' => $row->id, 'color_id' => $row->color_id, 'size' => $row->size, 'quantity' => $row->quantity])->all(),
            'translations' => ['de' => ['name' => 'Lederjacke', 'description' => 'Echte Lederjacke.']],
        ])->assertUnprocessable();

        $this->asAdmin('en')->deleteJson("/api/goods/{$id}")->assertNoContent();
        $this->assertDatabaseCount('good_translations', 0);
    }

    private function asAdmin(string $interfaceLocale)
    {
        return $this->withToken($this->accessToken($this->admin))->withHeader('Accept-Language', $interfaceLocale);
    }

    private function goodPayload(string $name, string $description): array
    {
        $category = Category::firstOrCreate(['name' => 'Clothing']);
        $subcategory = Subcategory::firstOrCreate(['name' => 'Jackets', 'category_id' => $category->id]);
        $color = Color::firstOrCreate(['name' => 'Brown'], ['hexcode' => '#654321']);

        return [
            'name' => $name,
            'brand' => 'Atelier Nord',
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'price' => '125.00',
            'description' => $description,
            'material_ids' => [Material::firstOrCreate(['name' => 'Leather'])->id],
            'inventory' => [['color_id' => $color->id, 'size' => null, 'quantity' => 1]],
        ];
    }

    private function fakeDeepL(): void
    {
        Http::fake(['*.deepl.com/*' => function (Request $request) {
            $target = $request->data()['target_lang'];

            return Http::response(['translations' => array_map(
                fn (string $text) => ['detected_source_language' => $request->data()['source_lang'], 'text' => "[{$target}] {$text}"],
                $request->data()['text'],
            )]);
        }]);
    }

    private function resetTranslationServices(): void
    {
        $this->app->forgetInstance(TranslationProvider::class);
        $this->app->forgetInstance(TranslationUsageTracker::class);
        $this->app->forgetInstance(CatalogTranslator::class);
    }
}

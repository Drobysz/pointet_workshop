<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const SOURCE_LOCALE_TABLES = ['goods', 'categories', 'subcategories', 'colors', 'materials'];

    public function up(): void
    {
        // Universal table for short catalog labels (categories, subcategories, colors, materials).
        Schema::create('translations', function (Blueprint $table): void {
            $table->id();
            $table->string('translatable_type', 64);
            $table->unsignedBigInteger('translatable_id');
            $table->string('field', 64);
            $table->string('locale', 8);
            $table->text('value');
            $table->char('source_hash', 64)->nullable();
            $table->boolean('is_manual')->default(false);
            $table->timestampsTz();
            $table->unique(['translatable_type', 'translatable_id', 'field', 'locale'], 'translations_target_unique');
            $table->index(['locale', 'source_hash']);
        });

        // Product translations. Description-related columns stay NULL until
        // product-description localization is explicitly enabled.
        Schema::create('good_translations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('good_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 8);
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->char('name_source_hash', 64)->nullable();
            $table->boolean('name_is_manual')->default(false);
            $table->timestampsTz();
            $table->unique(['good_id', 'locale']);
            $table->index(['locale', 'name_source_hash']);
        });

        // One row per provider and calendar month.
        Schema::create('translation_usage', function (Blueprint $table): void {
            $table->id();
            $table->string('provider', 32);
            $table->char('period', 7);
            $table->unsignedBigInteger('characters')->default(0);
            $table->unsignedBigInteger('character_limit')->nullable();
            $table->timestampTz('exhausted_at')->nullable();
            $table->timestampsTz();
            $table->unique(['provider', 'period']);
        });

        foreach (self::SOURCE_LOCALE_TABLES as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->string('source_locale', 8)->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (self::SOURCE_LOCALE_TABLES as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('source_locale');
            });
        }

        Schema::dropIfExists('translation_usage');
        Schema::dropIfExists('good_translations');
        Schema::dropIfExists('translations');
    }
};

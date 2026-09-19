<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_images', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('path')->unique();
            $table->string('url')->nullable();
            $table->timestampsTz();
        });
        Schema::table('categories', function (Blueprint $table): void {
            $table->foreignId('image_id')->nullable()->unique()
                ->constrained('category_images')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('image_id');
        });
        Schema::dropIfExists('category_images');
    }
};

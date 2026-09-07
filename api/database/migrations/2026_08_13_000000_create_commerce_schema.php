<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('refer_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('full_name');
            $table->string('avatar_url')->nullable();
            $table->string('role', 20)->default('user')->index();
            $table->timestampTz('email_verified_at')->nullable();
            $table->timestampsTz();
        });

        Schema::create('auth_refresh_tokens', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('family_id')->index();
            $table->char('token_hash', 64)->unique();
            $table->timestampTz('expires_at')->index();
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('last_used_at')->nullable();
            $table->string('user_agent', 1024)->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestampsTz();
            $table->index(['user_id', 'revoked_at']);
        });

        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->timestampsTz();
        });

        Schema::create('subcategories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->timestampsTz();
            $table->unique(['category_id', 'name']);
        });

        Schema::create('colors', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('hexcode', 7);
            $table->timestampsTz();
        });

        Schema::create('materials', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->timestampsTz();
        });

        Schema::create('goods', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('subcategory_id')->constrained()->restrictOnDelete();
            $table->string('name')->index();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('current_quantity')->default(0);
            $table->text('description');
            $table->timestampsTz();
            $table->index(['category_id', 'subcategory_id']);
            $table->index('price');
        });

        Schema::create('color_good', function (Blueprint $table): void {
            $table->foreignId('good_id')->constrained()->cascadeOnDelete();
            $table->foreignId('color_id')->constrained()->restrictOnDelete();
            $table->primary(['good_id', 'color_id']);
        });

        Schema::create('good_material', function (Blueprint $table): void {
            $table->foreignId('good_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->restrictOnDelete();
            $table->primary(['good_id', 'material_id']);
        });

        Schema::create('images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('good_id');
            $table->foreignId('color_id');
            $table->string('name');
            $table->string('path')->unique();
            $table->string('url')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestampsTz();
            $table->foreign(['good_id', 'color_id'])
                ->references(['good_id', 'color_id'])
                ->on('color_good')
                ->cascadeOnDelete();
            $table->unique(['good_id', 'color_id', 'name']);
            $table->index(['good_id', 'color_id', 'sort_order']);
        });

        Schema::create('baskets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('good_id')->constrained()->cascadeOnDelete();
            $table->foreignId('color_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestampsTz();
            $table->unique(['user_id', 'good_id', 'color_id']);
        });

        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('status', 24)->default('processing')->index();
            $table->timestampTz('placed_at')->useCurrent()->index();
            $table->timestampsTz();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('good_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('color_name')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->string('status', 24)->default('processing')->index();
            $table->timestampsTz();
            $table->index(['order_id', 'good_id']);
        });

        Schema::create('cache', function (Blueprint $table): void {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table): void {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))");
            DB::statement('ALTER TABLE goods ADD CONSTRAINT goods_price_nonnegative CHECK (price >= 0)');
            DB::statement('ALTER TABLE goods ADD CONSTRAINT goods_quantity_nonnegative CHECK (current_quantity >= 0)');
            DB::statement('ALTER TABLE baskets ADD CONSTRAINT baskets_quantity_positive CHECK (quantity > 0)');
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0)');
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_price_nonnegative CHECK (unit_price >= 0)');
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('processing', 'sent', 'delivered', 'reported', 'cancelled'))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_status_check CHECK (status IN ('processing', 'sent', 'delivered', 'reported', 'cancelled'))");
            DB::statement('CREATE UNIQUE INDEX users_email_normalized_unique ON users (lower(email))');
            DB::statement("CREATE INDEX goods_search_idx ON goods USING GIN (to_tsvector('simple', name || ' ' || description))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('baskets');
        Schema::dropIfExists('images');
        Schema::dropIfExists('good_material');
        Schema::dropIfExists('color_good');
        Schema::dropIfExists('goods');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('colors');
        Schema::dropIfExists('subcategories');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('auth_refresh_tokens');
        Schema::dropIfExists('users');
    }
};

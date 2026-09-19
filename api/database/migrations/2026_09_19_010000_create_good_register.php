<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('good_register', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('good_id')->constrained('goods')->cascadeOnDelete();
            $table->foreignId('color_id')->constrained('colors')->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->string('size', 120)->nullable();
        });
        // Ordinary unique constraints allow multiple NULL sizes on PostgreSQL and SQLite.
        DB::statement("CREATE UNIQUE INDEX good_register_variant_unique ON good_register (good_id, color_id, LOWER(COALESCE(size, '')))");
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE good_register ADD CONSTRAINT good_register_quantity_nonnegative CHECK (quantity >= 0)');
        } elseif (DB::getDriverName() === 'sqlite') {
            foreach (['INSERT', 'UPDATE'] as $event) {
                DB::statement('CREATE TRIGGER good_register_quantity_'.strtolower($event)." BEFORE {$event} ON good_register WHEN NEW.quantity < 0 BEGIN SELECT RAISE(ABORT, 'Inventory quantity must be nonnegative'); END");
            }
        }
        Schema::table('goods', function (Blueprint $table): void {
            $table->unsignedBigInteger('inventory_version')->default(0);
        });

        DB::table('goods')->orderBy('id')->chunkById(100, function ($goods): void {
            foreach ($goods as $good) {
                $colors = DB::table('color_good')->where('good_id', $good->id)->pluck('color_id');
                foreach ($colors as $color) {
                    DB::table('good_register')->insert(['good_id' => $good->id, 'color_id' => $color, 'quantity' => $colors->count() === 1 ? $good->current_quantity : 0, 'size' => null]);
                }
                // A product-wide count cannot safely be guessed for several colors.
                // Preserve it in an explicit, editable migration-only allocation.
                if ($colors->count() !== 1 && $good->current_quantity > 0) {
                    $unassigned = DB::table('colors')->where('name', 'Unassigned stock')->value('id');
                    $unassigned ??= DB::table('colors')->insertGetId(['name' => 'Unassigned stock', 'hexcode' => '#808080', 'created_at' => now(), 'updated_at' => now()]);
                    DB::table('good_register')->updateOrInsert(['good_id' => $good->id, 'color_id' => $unassigned, 'size' => null], ['quantity' => $good->current_quantity]);
                }
            }
        });
        Schema::table('images', function (Blueprint $table): void {
            $table->dropForeign(['good_id', 'color_id']);
            $table->foreign('good_id')->references('id')->on('goods')->cascadeOnDelete();
            $table->foreign('color_id')->references('id')->on('colors')->restrictOnDelete();
        });
        Schema::table('baskets', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'good_id', 'color_id']);
            $table->foreignId('good_register_id')->nullable()->constrained('good_register')->nullOnDelete();
            $table->unique(['user_id', 'good_register_id']);
        });
        DB::table('baskets')->orderBy('id')->chunkById(100, function ($baskets): void {
            foreach ($baskets as $basket) {
                $query = DB::table('good_register')->where('good_id', $basket->good_id);
                if ($basket->color_id !== null) {
                    $query->where('color_id', $basket->color_id);
                }
                $rows = $query->get();
                if ($rows->count() === 1 && ! DB::table('baskets')->where('user_id', $basket->user_id)->where('good_register_id', $rows[0]->id)->exists()) {
                    DB::table('baskets')->where('id', $basket->id)->update(['good_register_id' => $rows[0]->id, 'color_id' => $rows[0]->color_id]);
                }
            }
        });
        Schema::table('order_items', function (Blueprint $table): void {
            $table->foreignId('good_register_id')->nullable()->constrained('good_register')->nullOnDelete();
            $table->string('size', 120)->nullable();
        });
        Schema::drop('color_good');
    }

    public function down(): void
    {
        // Refuse an ambiguous rollback instead of merging customer basket selections.
        if (DB::table('baskets')->select('user_id', 'good_id', 'color_id')->groupBy('user_id', 'good_id', 'color_id')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Resolve baskets containing several sizes of the same color before rolling back inventory.');
        }
        Schema::create('color_good', function (Blueprint $table): void {
            $table->foreignId('good_id')->constrained()->cascadeOnDelete();
            $table->foreignId('color_id')->constrained()->restrictOnDelete();
            $table->primary(['good_id', 'color_id']);
        });
        DB::table('color_good')->insertUsing(['good_id', 'color_id'], DB::table('good_register')->select('good_id', 'color_id')->distinct());
        // Retain image associations even if data was changed outside the application.
        foreach (DB::table('images')->select('good_id', 'color_id')->distinct()->get() as $image) {
            DB::table('color_good')->insertOrIgnore((array) $image);
        }
        Schema::table('images', function (Blueprint $table): void {
            $table->dropForeign(['good_id']);
            $table->dropForeign(['color_id']);
            $table->foreign(['good_id', 'color_id'])->references(['good_id', 'color_id'])->on('color_good')->cascadeOnDelete();
        });
        Schema::table('baskets', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'good_register_id']);
            $table->dropConstrainedForeignId('good_register_id');
            $table->unique(['user_id', 'good_id', 'color_id']);
        });
        Schema::table('order_items', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('good_register_id');
            $table->dropColumn('size');
        });
        Schema::table('goods', fn (Blueprint $table) => $table->dropColumn('inventory_version'));
        Schema::drop('good_register');
    }
};

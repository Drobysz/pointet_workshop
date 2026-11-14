<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The interface language used to be an enum of five locales. A plain
     * string lets a new locale (here Ukrainian, "uk") be added in the request
     * validation alone, without another schema change.
     */
    public function up(): void
    {
        // PostgreSQL implements enum columns as a CHECK constraint that
        // survives a column type change, so it has to be dropped explicitly.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_language_check');
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->string('language', 8)->default('en')->change();
        });
    }

    public function down(): void
    {
        DB::table('users')
            ->whereNotIn('language', ['en', 'it', 'fr', 'ru', 'de'])
            ->update(['language' => 'en']);

        Schema::table('users', function (Blueprint $table): void {
            $table->enum('language', ['en', 'it', 'fr', 'ru', 'de'])->default('en')->change();
        });
    }
};

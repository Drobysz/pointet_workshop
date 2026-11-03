<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_sessions', function (Blueprint $table): void {
            $table->id();
            $table->char('token_hash', 64)->unique();
            $table->timestampTz('expires_at')->index();
            $table->timestampTz('revoked_at')->nullable()->index();
            $table->timestampsTz();
        });

        foreach (['orders', 'preorders', 'preorder_checkout_sessions'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->foreignId('guest_session_id')->nullable()->after('user_id')
                    ->constrained('guest_sessions')->nullOnDelete();
                $table->index(['guest_session_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        foreach (['preorder_checkout_sessions', 'preorders', 'orders'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->dropConstrainedForeignId('guest_session_id');
            });
        }
        Schema::dropIfExists('guest_sessions');
    }
};

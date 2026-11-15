<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_checkout_sessions', function (Blueprint $table): void {
            // Part of payment_amount_cents: one delivery fee per distinct brand in the basket.
            $table->unsignedInteger('delivery_cents')->default(0)->after('payment_amount_cents');
        });
    }

    public function down(): void
    {
        Schema::table('order_checkout_sessions', function (Blueprint $table): void {
            $table->dropColumn('delivery_cents');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['orders', 'order_checkout_sessions'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                // Delivery address snapshot. Null when the customer did not provide one.
                $table->string('customer_address', 500)->nullable()->after('customer_email');
            });
        }
    }

    public function down(): void
    {
        foreach (['order_checkout_sessions', 'orders'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->dropColumn('customer_address');
            });
        }
    }
};

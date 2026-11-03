<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preorder_checkout_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->index();
            $table->json('basket_snapshot');
            $table->string('payment_status', 24)->default('pending')->index();
            $table->unsignedInteger('payment_amount_cents');
            $table->string('currency', 3)->default('eur');
            $table->uuid('idempotency_key')->unique();
            $table->string('stripe_checkout_session_id')->nullable()->unique();
            $table->text('stripe_checkout_url')->nullable();
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->foreignId('preorder_id')->nullable()->unique()->constrained('preorders')->nullOnDelete();
            $table->timestampTz('paid_at')->nullable()->index();
            $table->timestampsTz();
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preorder_checkout_sessions');
    }
};

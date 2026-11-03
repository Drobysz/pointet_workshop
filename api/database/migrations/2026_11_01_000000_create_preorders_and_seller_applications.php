<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preorders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->index();
            $table->string('payment_status', 24)->default('pending')->index();
            $table->unsignedInteger('payment_amount_cents');
            $table->string('currency', 3)->default('eur');
            $table->uuid('idempotency_key')->unique();
            $table->string('stripe_checkout_session_id')->nullable()->unique();
            $table->text('stripe_checkout_url')->nullable();
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->timestampTz('paid_at')->nullable()->index();
            $table->timestampsTz();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('preorder_registers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('preorder_id')->constrained('preorders')->cascadeOnDelete();
            $table->foreignId('good_id')->nullable()->constrained('goods')->nullOnDelete();
            $table->foreignId('good_register_id')->nullable()->constrained('good_register')->nullOnDelete();
            $table->string('product_name');
            $table->string('color_name')->nullable();
            $table->string('size')->nullable();
            $table->decimal('original_unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->timestampsTz();
            $table->index(['preorder_id', 'good_id']);
            $table->index('good_id');
        });

        Schema::create('stripe_webhook_events', function (Blueprint $table): void {
            $table->id();
            $table->string('stripe_event_id')->unique();
            $table->string('type');
            $table->timestampTz('processed_at');
            $table->timestampsTz();
        });

        Schema::create('seller_applications', function (Blueprint $table): void {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('tel_number', 32);
            $table->string('country', 100);
            $table->string('email')->index();
            $table->string('brand_name')->index();
            $table->string('company_address');
            $table->text('description_of_contact');
            $table->text('description_of_brand');
            $table->boolean('is_resident_of_eu');
            $table->string('status', 24)->default('processing')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->text('response_message')->nullable();
            $table->timestampTz('response_sent_at')->nullable();
            $table->timestampsTz();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_applications');
        Schema::dropIfExists('stripe_webhook_events');
        Schema::dropIfExists('preorder_registers');
        Schema::dropIfExists('preorders');
    }
};

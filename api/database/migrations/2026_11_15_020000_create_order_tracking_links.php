<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_tracking_links', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // The admin who added the link; kept nullable so removing the account keeps the history.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('tracking_url');
            $table->timestampsTz();
            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_tracking_links');
    }
};

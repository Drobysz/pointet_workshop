<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactional_emails', function (Blueprint $table): void {
            $table->id();
            $table->string('event_key')->unique();
            $table->string('template', 32);
            $table->string('locale', 8);
            $table->text('payload')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->timestampTz('available_at')->nullable()->index();
            $table->timestampTz('sent_at')->nullable();
            $table->timestampsTz();
        });

        Schema::create('failed_jobs', function (Blueprint $table): void {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        Schema::table('seller_applications', function (Blueprint $table): void {
            $table->string('submission_fingerprint', 64)->nullable()->unique();
        });

        Schema::table('auth_refresh_tokens', function (Blueprint $table): void {
            $table->string('device_hash', 64)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('auth_refresh_tokens', function (Blueprint $table): void {
            $table->dropColumn('device_hash');
        });

        Schema::table('seller_applications', function (Blueprint $table): void {
            $table->dropUnique(['submission_fingerprint']);
            $table->dropColumn('submission_fingerprint');
        });

        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('transactional_emails');
    }
};

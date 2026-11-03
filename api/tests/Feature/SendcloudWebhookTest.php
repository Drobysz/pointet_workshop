<?php

namespace Tests\Feature;

use Tests\TestCase;

class SendcloudWebhookTest extends TestCase
{
    public function test_sendcloud_webhook_acknowledges_public_post_requests(): void
    {
        $this->postJson('/api/webhooks/sendcloud', ['event' => 'parcel_status_changed'])
            ->assertOk()
            ->assertExactJson(['success' => true]);
    }
}

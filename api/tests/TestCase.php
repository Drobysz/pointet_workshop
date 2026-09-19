<?php

namespace Tests;

use App\Models\User;
use App\Services\Auth\AccessTokenService;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config()->set('filesystems.disks.s3.key', 'testing');
        config()->set('filesystems.disks.s3.secret', 'testing');
        config()->set('filesystems.disks.s3.bucket', 'testing');
        Storage::fake('s3');
        $private = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($private, $privatePem);
        $publicPem = openssl_pkey_get_details($private)['key'];
        config()->set('auth_tokens.private_key', $privatePem);
        config()->set('auth_tokens.public_key', $publicPem);
        config()->set('auth_tokens.pending_store', 'array');
        config()->set('auth_tokens.cookies.secure', false);
    }

    protected function accessToken(User $user): string
    {
        return app(AccessTokenService::class)->issue($user);
    }
}

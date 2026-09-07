<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\TestAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TestAdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_verified_admin_accounts_and_is_repeatable(): void
    {
        $this->seed(TestAdminSeeder::class);
        $this->seed(TestAdminSeeder::class);

        $admins = User::query()
            ->whereIn('email', [
                'admin@example.test',
                'catalog.admin@example.test',
                'orders.admin@example.test',
            ])
            ->get();

        $this->assertCount(3, $admins);

        foreach ($admins as $admin) {
            $this->assertSame(UserRole::Admin, $admin->role);
            $this->assertNotNull($admin->email_verified_at);
            $this->assertTrue(Hash::check('password', $admin->password));
        }
    }
}

<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestAdminSeeder extends Seeder
{
    /**
     * Seed deterministic administrator accounts for local development and testing.
     */
    public function run(): void
    {
        $admins = [
            [
                'full_name' => 'Demo Administrator',
                'email' => 'admin@example.test',
            ],
            [
                'full_name' => 'Catalog Administrator',
                'email' => 'catalog.admin@example.test',
            ],
            [
                'full_name' => 'Orders Administrator',
                'email' => 'orders.admin@example.test',
            ],
        ];

        foreach ($admins as $admin) {
            User::query()
                ->firstOrNew(['email' => $admin['email']])
                ->forceFill([
                    'full_name' => $admin['full_name'],
                    'password' => 'password',
                    'role' => UserRole::Admin,
                    'email_verified_at' => now(),
                    'avatar_url' => null,
                    'refer_id' => null,
                ])
                ->save();
        }
    }
}

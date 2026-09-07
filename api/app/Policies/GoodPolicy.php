<?php

namespace App\Policies;

use App\Models\Good;
use App\Models\User;

class GoodPolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Good $good): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Good $good): bool
    {
        return $user->isAdmin();
    }
}

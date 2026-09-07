<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $actor, User $subject): bool
    {
        return $actor->isAdmin() || $actor->is($subject);
    }

    public function update(User $actor, User $subject): bool
    {
        return $actor->isAdmin() || $actor->is($subject);
    }

    public function delete(User $actor, User $subject): bool
    {
        return $actor->isAdmin() || $actor->is($subject);
    }
}

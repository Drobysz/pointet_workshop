<?php

namespace App\Policies;

use App\Models\Basket;
use App\Models\User;

class BasketPolicy
{
    public function view(User $user, Basket $basket): bool
    {
        return $user->isAdmin() || $basket->user_id === $user->id;
    }

    public function update(User $user, Basket $basket): bool
    {
        return $user->isAdmin() || $basket->user_id === $user->id;
    }

    public function delete(User $user, Basket $basket): bool
    {
        return $user->isAdmin() || $basket->user_id === $user->id;
    }
}

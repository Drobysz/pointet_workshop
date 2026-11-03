<?php

namespace App\Policies;

use App\Models\Preorder;
use App\Models\User;

class PreorderPolicy
{
    public function view(User $user, Preorder $preorder): bool
    {
        return $user->isAdmin() || $preorder->user_id === $user->id;
    }

    public function delete(User $user, Preorder $preorder): bool
    {
        return $user->isAdmin() && $preorder->payment_status->value !== 'paid';
    }

    public function update(User $user, Preorder $preorder): bool
    {
        return $user->isAdmin() && $preorder->payment_status->value !== 'paid';
    }
}

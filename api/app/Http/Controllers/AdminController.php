<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\AdminCreateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function store(AdminCreateRequest $request): UserResource
    {
        $data = $request->validated();
        $admin = User::create(['email' => Str::lower(trim($data['email'])), 'password' => Hash::make($data['password']), 'full_name' => trim($data['full_name']), 'address' => '', 'language' => 'en']);
        $admin->forceFill(['role' => UserRole::Admin, 'email_verified_at' => now()])->save();

        return new UserResource($admin);
    }

    public function show(User $admin): UserResource
    {
        abort_unless($admin->isAdmin(), 404);

        return new UserResource($admin);
    }
}

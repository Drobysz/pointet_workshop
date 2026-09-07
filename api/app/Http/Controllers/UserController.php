<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\UserCreateRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\SessionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(private readonly SessionService $sessions) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'role' => ['nullable', 'in:user,admin'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::query()
            ->when(
                $filters['role'] ?? null,
                fn ($query, $role) => $query->where('role', $role),
            )
            ->when(
                $filters['search'] ?? null,
                function ($query, string $search): void {
                    $phrase = '%'.mb_strtolower(trim($search)).'%';

                    $query->where(function ($innerQuery) use ($phrase): void {
                        $innerQuery
                            ->whereRaw('LOWER(full_name) LIKE ?', [$phrase])
                            ->orWhereRaw('LOWER(email) LIKE ?', [$phrase]);
                    });
                },
            )
            ->latest('id')
            ->paginate($filters['per_page'] ?? 7)
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(UserCreateRequest $request): UserResource
    {
        $this->authorize('create', User::class);
        $data = $request->validated();

        $user = User::create([
            'email' => Str::lower(trim($data['email'])),
            'full_name' => trim($data['full_name']),
            'avatar_url' => $data['avatar_url'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        $user->forceFill([
            'role' => UserRole::User,
            'email_verified_at' => now(),
        ])->save();

        return new UserResource($user);
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        return new UserResource($user);
    }

    public function update(UserUpdateRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);
        $data = $request->validated();

        if (isset($data['email'])) {
            $data['email'] = Str::lower(trim($data['email']));
        }

        $passwordChanged = isset($data['password']);

        if ($passwordChanged) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        if ($passwordChanged) {
            $this->sessions->revokeAll($user);
        }

        return new UserResource($user->fresh());
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $isDeletingActiveAdmin = request()->user()->is($user)
            && $user->isAdmin();

        abort_if(
            $isDeletingActiveAdmin,
            409,
            'Administrators cannot delete their active account.',
        );

        $user->delete();

        return response()->noContent();
    }
}

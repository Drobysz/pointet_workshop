<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\EmailChangeRequest;
use App\Http\Requests\EmailChangeVerificationRequest;
use App\Http\Requests\PasswordChangeRequest;
use App\Http\Requests\UserCreateRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Mail\VerifyEmailChangeMail;
use App\Models\User;
use App\Services\Auth\EmailChangeService;
use App\Services\Auth\SessionService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class UserController extends Controller
{
    public function __construct(
        private readonly SessionService $sessions,
        private readonly EmailChangeService $emailChanges,
    ) {}

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
            'address' => trim($data['address']),
            'tel' => isset($data['tel']) ? trim($data['tel']) : null,
            'language' => $data['language'] ?? 'en',
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

        foreach (['full_name', 'address', 'tel'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = trim($data[$field]);
            }
        }

        $user->update($data);

        return new UserResource($user->fresh());
    }

    public function requestEmailChange(EmailChangeRequest $request, User $user)
    {
        $this->authorize('update', $user);
        $email = $request->validated('email');
        try {
            $code = $this->emailChanges->request($user, $email);
        } catch (QueryException) {
            return response()->json(['error' => ['code' => 'email_change_pending', 'message' => 'This email already has a pending change request.']], 409);
        }

        try {
            Mail::to($email)->send(new VerifyEmailChangeMail($code));
        } catch (Throwable $exception) {
            $this->emailChanges->discard($user, $code);
            report($exception);

            return response()->json(['error' => ['code' => 'email_delivery_unavailable', 'message' => 'Verification email could not be sent.']], 502);
        }

        return response()->json(['data' => ['status' => 'pending_verification']], 202);
    }

    public function verifyEmailChange(EmailChangeVerificationRequest $request, User $user)
    {
        $this->authorize('update', $user);
        try {
            $result = $this->emailChanges->verify($user, $request->validated('code'));
        } catch (QueryException) {
            return response()->json(['error' => ['code' => 'duplicate_email', 'message' => 'This email is already registered.']], 409);
        }

        if ($result['status'] === 'verified') {
            return new UserResource($result['user']);
        }

        if ($result['status'] === 'duplicate_email') {
            return response()->json(['error' => ['code' => 'duplicate_email', 'message' => 'This email is already registered.']], 409);
        }

        throw ValidationException::withMessages([
            'code' => [$result['status'] === 'expired'
                ? 'The verification code has expired.'
                : 'The verification code is invalid.'],
        ]);
    }

    public function updatePassword(PasswordChangeRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);
        $data = $request->validated();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['The current password is incorrect.']]);
        }

        if (Hash::check($data['new_password'], $user->password)) {
            throw ValidationException::withMessages(['new_password' => ['The new password must differ from the current password.']]);
        }

        $user->forceFill(['password' => Hash::make($data['new_password'])])->save();
        $this->sessions->revokeAll($user);

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

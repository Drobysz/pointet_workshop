<?php

namespace App\Services\Auth;

use App\Models\EmailChangeVerification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EmailChangeService
{
    public function request(User $user, string $newEmail): string
    {
        $code = (string) random_int(100000, 999999);

        DB::transaction(function () use ($user, $newEmail, $code): void {
            EmailChangeVerification::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->delete();

            EmailChangeVerification::create([
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'code_hash' => hash('sha256', $code),
                'expires_at' => now()->addMinutes(config('auth_tokens.email_change_code_ttl_minutes')),
            ]);
        }, 3);

        return $code;
    }

    public function discard(User $user, string $code): void
    {
        EmailChangeVerification::query()
            ->where('user_id', $user->id)
            ->where('code_hash', hash('sha256', $code))
            ->delete();
    }

    /**
     * @return array{status: 'verified'|'invalid'|'expired'|'duplicate_email', user?: User}
     */
    public function verify(User $user, string $code): array
    {
        return DB::transaction(function () use ($user, $code): array {
            $verification = EmailChangeVerification::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $verification) {
                return ['status' => 'invalid'];
            }

            if ($verification->expires_at->isPast()) {
                $verification->delete();

                return ['status' => 'expired'];
            }

            if (! hash_equals($verification->code_hash, hash('sha256', $code))) {
                return ['status' => 'invalid'];
            }

            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            if (User::query()
                ->whereRaw('LOWER(email) = ?', [$verification->new_email])
                ->where('id', '!=', $lockedUser->id)
                ->exists()) {
                $verification->delete();

                return ['status' => 'duplicate_email'];
            }

            $lockedUser->forceFill(['email' => $verification->new_email])->save();

            $verification->delete();

            return ['status' => 'verified', 'user' => $lockedUser->fresh()];
        }, 3);
    }
}

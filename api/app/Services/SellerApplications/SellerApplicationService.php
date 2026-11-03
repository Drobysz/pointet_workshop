<?php

namespace App\Services\SellerApplications;

use App\Enums\SellerApplicationStatus;
use App\Mail\SellerApplicationReviewedMail;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SellerApplicationService
{
    public function review(SellerApplication $application, User $reviewer, bool $approved, string $response): SellerApplication
    {
        $reviewed = DB::transaction(function () use ($application, $reviewer, $approved, $response): SellerApplication {
            $locked = SellerApplication::query()->lockForUpdate()->findOrFail($application->id);
            abort_if($locked->status !== SellerApplicationStatus::Processing, 409, 'This application has already been reviewed.');
            $locked->update([
                'status' => $approved ? SellerApplicationStatus::Approved : SellerApplicationStatus::Declined,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'response_message' => $response,
            ]);

            return $locked->fresh();
        }, 3);

        try {
            Mail::to($reviewed->email)->queue(new SellerApplicationReviewedMail($reviewed));
            $reviewed->update(['response_sent_at' => now()]);
        } catch (\Throwable $exception) {
            Log::error('Seller application review email could not be queued.', ['application_id' => $reviewed->id, 'exception' => $exception->getMessage()]);
        }

        return $reviewed->fresh();
    }
}

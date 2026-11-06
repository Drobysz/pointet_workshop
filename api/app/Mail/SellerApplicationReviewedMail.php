<?php

namespace App\Mail;

use App\Models\SellerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SellerApplicationReviewedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly SellerApplication $application) {}

    public function build(): self
    {
        return $this->subject('Pointet — application update')
            ->view('mail.seller-application-reviewed');
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly string $verificationUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Confirm your email address');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.verify-email');
    }
}

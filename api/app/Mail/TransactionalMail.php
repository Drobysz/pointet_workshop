<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Carbon;
use IntlDateFormatter;
use NumberFormatter;

class TransactionalMail extends Mailable
{
    public function __construct(public readonly string $template, private readonly array $details) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: __("transactional_mail.{$this->template}.subject"));
    }

    public function content(): Content
    {
        $locale = app()->getLocale();
        $text = __("transactional_mail.{$this->template}");
        $name = trim($this->details['name'] ?? '');
        $date = isset($this->details['date']) ? Carbon::parse($this->details['date']) : null;
        $dateFormatter = new IntlDateFormatter(
            $locale,
            IntlDateFormatter::LONG,
            $this->template === 'device' ? IntlDateFormatter::SHORT : IntlDateFormatter::NONE,
            'UTC',
        );
        $amount = isset($this->details['amount_cents'])
            ? (new NumberFormatter($locale, NumberFormatter::CURRENCY))
                ->formatCurrency($this->details['amount_cents'] / 100, strtoupper($this->details['currency']))
            : null;

        $deliveryFee = ($this->details['delivery_cents'] ?? 0) > 0 && isset($this->details['currency'])
            ? (new NumberFormatter($locale, NumberFormatter::CURRENCY))
                ->formatCurrency($this->details['delivery_cents'] / 100, strtoupper($this->details['currency']))
            : null;

        return new Content(view: 'mail.transactional.html', text: 'mail.transactional.text', with: [
            'language' => $locale,
            'title' => $text['subject'],
            'greeting' => $name === '' ? __('transactional_mail.greeting') : __('transactional_mail.named_greeting', ['name' => $name]),
            'paragraphs' => $text['paragraphs'],
            'reference' => isset($this->details['reference'])
                ? __("transactional_mail.{$this->template}.reference", ['reference' => $this->details['reference']])
                : null,
            'dateLabel' => $date ? __('transactional_mail.date', ['date' => $dateFormatter->format($date)]) : null,
            'deviceTime' => $this->template === 'device',
            'browser' => $this->details['browser'] ?? null,
            'os' => $this->details['os'] ?? null,
            // Table labels live next to each template's own copy (preorder, order).
            'labels' => $text,
            'items' => $this->details['items'] ?? [],
            'delivery' => $this->details['delivery'] ?? null,
            'amount' => $amount,
            'deliveryFee' => $deliveryFee,
            'detailsUrl' => $this->details['details_url'] ?? null,
        ]);
    }
}

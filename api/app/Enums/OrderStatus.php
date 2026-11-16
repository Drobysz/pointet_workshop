<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Processing = 'processing';
    case Sent = 'sent';
    case Shipped = 'shipped';
    case Reported = 'reported';
    case Cancelled = 'cancelled';
}

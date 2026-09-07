<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Processing = 'processing';
    case Sent = 'sent';
    case Delivered = 'delivered';
    case Reported = 'reported';
    case Cancelled = 'cancelled';
}

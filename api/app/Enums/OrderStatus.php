<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Processing = 'processing';
    case Sent = 'sent';
    case BeingDelivered = 'being_delivered';
    case Reported = 'reported';
    case Cancelled = 'cancelled';
}

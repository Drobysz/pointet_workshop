<?php

namespace App\Enums;

enum PreorderPaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Canceled = 'canceled';
    case Refunded = 'refunded';
}

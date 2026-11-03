<?php

namespace App\Enums;

enum SellerApplicationStatus: string
{
    case Processing = 'processing';
    case Approved = 'approved';
    case Declined = 'declined';
}

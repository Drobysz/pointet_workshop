<?php

return [
    'greeting' => 'Hello,',
    'named_greeting' => 'Hello, :name,',
    'signature' => 'The Pointet Team',
    'date' => 'Date: :date',
    'seller' => [
        'subject' => 'We Received Your Seller Application — Pointet',
        'paragraphs' => [
            'Thank you for your interest in becoming a seller on Pointet! Your application has been successfully submitted.',
            'Our team will review your application and contact you shortly at the email address you provided.',
        ],
    ],
    'preorder' => [
        'subject' => 'Your Preorder Is Confirmed — Pointet',
        'paragraphs' => [
            'Your payment was successful and your preorder is confirmed. We’ll email you when there’s an update.',
            'The payment covers the preorder as a whole.',
        ],
        'reference' => 'Preorder #:reference',
        'product' => 'Product',
        'quantity' => 'Quantity',
        'total' => 'Total paid',
        'details' => 'View your preorder',
    ],
    'order' => [
        'subject' => 'Your Order Is Confirmed — Pointet',
        'paragraphs' => [
            'Your payment was successful and your order is confirmed. We’ll email you when it ships.',
            'We’ll use the delivery details below to deliver your order and to contact you if needed.',
        ],
        'reference' => 'Order #:reference',
        'product' => 'Product',
        'quantity' => 'Quantity',
        'total' => 'Total paid',
        'details' => 'View your order',
        'delivery_fee' => 'Delivery',
        'delivery' => 'Delivery details',
    ],
    'tracking' => [
        'subject' => 'Your Order Has Been Shipped — Pointet',
        'paragraphs' => [
            'Good news: your order is on its way. You can follow the parcel with the tracking link below.',
            'Tracking details can take a little while to appear after dispatch.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'Track your order',
    ],
    'status_processing' => [
        'subject' => 'Your Order Is Being Prepared — Pointet',
        'paragraphs' => [
            'Your order is back in processing and is being prepared.',
            'We’ll email you again as soon as it ships.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'View your order',
    ],
    'status_sent' => [
        'subject' => 'Your Order Has Been Shipped — Pointet',
        'paragraphs' => [
            'Good news: your order has been handed over for delivery.',
            'If a tracking link is available, we’ll email it to you.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'View your order',
    ],
    'status_being_delivered' => [
        'subject' => 'Your Order Is Being Delivered — Pointet',
        'paragraphs' => [
            'Your order is on its way to you and is now being delivered.',
            'If something doesn’t look right, please contact us.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'View your order',
    ],
    'status_reported' => [
        'subject' => 'An Issue Was Reported With Your Order — Pointet',
        'paragraphs' => [
            'An issue has been reported with your order and we are looking into it.',
            'We’ll contact you as soon as we have an update.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'View your order',
    ],
    'status_cancelled' => [
        'subject' => 'Your Order Was Cancelled — Pointet',
        'paragraphs' => [
            'Your order has been cancelled.',
            'If you have any questions about it, please contact us.',
        ],
        'reference' => 'Order #:reference',
        'details' => 'View your order',
    ],
    'device' => [
        'subject' => 'New Device Sign-In — Pointet',
        'paragraphs' => [
            'We noticed a sign-in to your Pointet account from a new device.',
            'If you don’t recognize this sign-in, change your password and sign out of all devices.',
        ],
        'browser' => 'Browser: :browser',
        'os' => 'Operating system: :os',
    ],
    'welcome' => [
        'subject' => 'Welcome to Pointet!',
        'paragraphs' => [
            'Your email address has been verified and your Pointet account is ready.',
            'You can now explore our products and manage your orders.',
        ],
    ],
];

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

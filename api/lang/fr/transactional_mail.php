<?php

return [
    'greeting' => 'Bonjour,',
    'named_greeting' => 'Bonjour :name,',
    'signature' => 'L’équipe Pointet',
    'date' => 'Date : :date',
    'preorder' => [
        'subject' => 'Votre précommande est confirmée — Pointet',
        'paragraphs' => [
            'Votre paiement a bien été reçu et votre précommande est confirmée. Nous vous informerons par e-mail de la suite.',
            'Le paiement couvre l’ensemble de la précommande.',
        ],
        'reference' => 'Précommande nº :reference',
        'product' => 'Produit',
        'quantity' => 'Quantité',
        'total' => 'Total payé',
        'details' => 'Voir votre précommande',
    ],
    'order' => [
        'subject' => 'Votre commande est confirmée — Pointet',
        'paragraphs' => [
            'Votre paiement a bien été reçu et votre commande est confirmée. Nous vous écrirons lors de son expédition.',
            'Nous utiliserons les informations de livraison ci-dessous pour vous livrer et vous contacter si nécessaire.',
        ],
        'reference' => 'Commande nº :reference',
        'product' => 'Produit',
        'quantity' => 'Quantité',
        'total' => 'Total payé',
        'details' => 'Voir votre commande',
        'delivery_fee' => 'Livraison',
        'delivery' => 'Informations de livraison',
    ],
    'device' => [
        'subject' => 'Connexion depuis un nouvel appareil — Pointet',
        'paragraphs' => [
            'Une connexion à votre compte Pointet a été effectuée depuis un nouvel appareil.',
            'Si vous ne reconnaissez pas cette connexion, changez votre mot de passe et déconnectez-vous de tous vos appareils.',
        ],
        'browser' => 'Navigateur : :browser',
        'os' => 'Système d’exploitation : :os',
    ],
    'welcome' => [
        'subject' => 'Bienvenue sur Pointet !',
        'paragraphs' => [
            'Votre adresse e-mail a été vérifiée et votre compte Pointet est prêt.',
            'Vous pouvez désormais découvrir nos produits et gérer vos commandes.',
        ],
    ],
];

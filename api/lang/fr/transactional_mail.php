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
    'tracking' => [
        'subject' => 'Votre commande a été expédiée — Pointet',
        'paragraphs' => [
            'Bonne nouvelle : votre commande est en route. Vous pouvez suivre le colis grâce au lien de suivi ci-dessous.',
            'Les informations de suivi peuvent mettre un peu de temps à apparaître après l’expédition.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Suivre ma commande',
    ],
    'status_processing' => [
        'subject' => 'Votre commande est en préparation — Pointet',
        'paragraphs' => [
            'Votre commande est de nouveau en cours de traitement et en préparation.',
            'Nous vous écrirons dès son expédition.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Voir votre commande',
    ],
    'status_sent' => [
        'subject' => 'Votre commande a été expédiée — Pointet',
        'paragraphs' => [
            'Bonne nouvelle : votre commande a été confiée au transporteur.',
            'Si un lien de suivi est disponible, nous vous l’enverrons par e-mail.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Voir votre commande',
    ],
    'status_being_delivered' => [
        'subject' => 'Votre commande est en cours de livraison — Pointet',
        'paragraphs' => [
            'Votre commande est en route et est actuellement en cours de livraison.',
            'Si quelque chose ne va pas, contactez-nous.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Voir votre commande',
    ],
    'status_reported' => [
        'subject' => 'Un problème a été signalé sur votre commande — Pointet',
        'paragraphs' => [
            'Un problème a été signalé sur votre commande et nous l’examinons.',
            'Nous vous contacterons dès que nous aurons du nouveau.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Voir votre commande',
    ],
    'status_cancelled' => [
        'subject' => 'Votre commande a été annulée — Pointet',
        'paragraphs' => [
            'Votre commande a été annulée.',
            'Si vous avez des questions, n’hésitez pas à nous contacter.',
        ],
        'reference' => 'Commande n° :reference',
        'details' => 'Voir votre commande',
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

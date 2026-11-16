<?php

return [
    'greeting' => 'Hallo,',
    'named_greeting' => 'Hallo :name,',
    'signature' => 'Das Pointet-Team',
    'date' => 'Datum: :date',
    'preorder' => [
        'subject' => 'Deine Vorbestellung ist bestätigt — Pointet',
        'paragraphs' => [
            'Deine Zahlung war erfolgreich und deine Vorbestellung ist bestätigt. Sobald es Neuigkeiten gibt, melden wir uns per E-Mail.',
            'Die Zahlung gilt für die gesamte Vorbestellung.',
        ],
        'reference' => 'Vorbestellung Nr. :reference',
        'product' => 'Produkt',
        'quantity' => 'Menge',
        'total' => 'Gesamtbetrag bezahlt',
        'details' => 'Vorbestellung ansehen',
    ],
    'order' => [
        'subject' => 'Deine Bestellung ist bestätigt — Pointet',
        'paragraphs' => [
            'Deine Zahlung war erfolgreich und deine Bestellung ist bestätigt. Wir melden uns per E-Mail, sobald sie versandt wird.',
            'Mit den unten stehenden Lieferdaten liefern wir deine Bestellung aus und kontaktieren dich bei Bedarf.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'product' => 'Produkt',
        'quantity' => 'Menge',
        'total' => 'Gesamtbetrag bezahlt',
        'details' => 'Bestellung ansehen',
        'delivery_fee' => 'Versand',
        'delivery' => 'Lieferdaten',
    ],
    'tracking' => [
        'subject' => 'Deine Bestellung wurde versandt — Pointet',
        'paragraphs' => [
            'Gute Nachrichten: Deine Bestellung ist unterwegs. Mit dem Tracking-Link unten kannst du das Paket verfolgen.',
            'Es kann etwas dauern, bis die Sendungsdaten nach dem Versand sichtbar sind.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung verfolgen',
    ],
    'status_processing' => [
        'subject' => 'Deine Bestellung wird vorbereitet — Pointet',
        'paragraphs' => [
            'Deine Bestellung ist wieder in Bearbeitung und wird vorbereitet.',
            'Wir schreiben dir erneut, sobald sie versandt wird.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung ansehen',
    ],
    'status_sent' => [
        'subject' => 'Deine Bestellung wurde versandt — Pointet',
        'paragraphs' => [
            'Gute Nachrichten: Deine Bestellung wurde an den Versand übergeben.',
            'Falls ein Tracking-Link verfügbar ist, senden wir ihn dir per E-Mail.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung ansehen',
    ],
    'status_shipped' => [
        'subject' => 'Deine Bestellung wurde zugestellt — Pointet',
        'paragraphs' => [
            'Laut unseren Daten wurde deine Bestellung zugestellt.',
            'Wir hoffen, sie gefällt dir. Falls etwas nicht stimmt, melde dich bitte bei uns.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung ansehen',
    ],
    'status_reported' => [
        'subject' => 'Zu deiner Bestellung wurde ein Problem gemeldet — Pointet',
        'paragraphs' => [
            'Zu deiner Bestellung wurde ein Problem gemeldet und wir prüfen es.',
            'Wir melden uns, sobald es Neuigkeiten gibt.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung ansehen',
    ],
    'status_cancelled' => [
        'subject' => 'Deine Bestellung wurde storniert — Pointet',
        'paragraphs' => [
            'Deine Bestellung wurde storniert.',
            'Bei Fragen melde dich bitte bei uns.',
        ],
        'reference' => 'Bestellung Nr. :reference',
        'details' => 'Bestellung ansehen',
    ],
    'device' => [
        'subject' => 'Anmeldung von einem neuen Gerät — Pointet',
        'paragraphs' => [
            'Wir haben eine Anmeldung bei deinem Pointet-Konto von einem neuen Gerät festgestellt.',
            'Wenn du diese Anmeldung nicht erkennst, ändere dein Passwort und melde dich auf allen Geräten ab.',
        ],
        'browser' => 'Browser: :browser',
        'os' => 'Betriebssystem: :os',
    ],
    'welcome' => [
        'subject' => 'Willkommen bei Pointet!',
        'paragraphs' => [
            'Deine E-Mail-Adresse wurde bestätigt und dein Pointet-Konto ist eingerichtet.',
            'Du kannst jetzt unsere Produkte entdecken und deine Bestellungen verwalten.',
        ],
    ],
];

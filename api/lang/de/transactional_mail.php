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

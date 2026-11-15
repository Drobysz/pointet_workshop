<?php

return [
    'greeting' => 'Ciao,',
    'named_greeting' => 'Ciao :name,',
    'signature' => 'Il team di Pointet',
    'date' => 'Data: :date',
    'preorder' => [
        'subject' => 'Il tuo preordine è confermato — Pointet',
        'paragraphs' => [
            'Il pagamento è andato a buon fine e il tuo preordine è confermato. Ti scriveremo via e-mail quando ci saranno aggiornamenti.',
            'Il pagamento copre l’intero preordine.',
        ],
        'reference' => 'Preordine n. :reference',
        'product' => 'Prodotto',
        'quantity' => 'Quantità',
        'total' => 'Totale pagato',
        'details' => 'Visualizza il tuo preordine',
    ],
    'order' => [
        'subject' => 'Il tuo ordine è confermato — Pointet',
        'paragraphs' => [
            'Il pagamento è andato a buon fine e il tuo ordine è confermato. Ti scriveremo via e-mail quando verrà spedito.',
            'Useremo i dati di consegna qui sotto per consegnare l’ordine e contattarti, se necessario.',
        ],
        'reference' => 'Ordine n. :reference',
        'product' => 'Prodotto',
        'quantity' => 'Quantità',
        'total' => 'Totale pagato',
        'details' => 'Visualizza il tuo ordine',
        'delivery_fee' => 'Spedizione',
        'delivery' => 'Dati di consegna',
    ],
    'tracking' => [
        'subject' => 'Il tuo ordine è stato spedito — Pointet',
        'paragraphs' => [
            'Buone notizie: il tuo ordine è in viaggio. Puoi seguire il pacco con il link di tracciamento qui sotto.',
            'Le informazioni di tracciamento possono impiegare un po’ di tempo ad apparire dopo la spedizione.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Traccia il tuo ordine',
    ],
    'status_processing' => [
        'subject' => 'Il tuo ordine è in preparazione — Pointet',
        'paragraphs' => [
            'Il tuo ordine è di nuovo in lavorazione e viene preparato.',
            'Ti scriveremo non appena sarà spedito.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Vedi il tuo ordine',
    ],
    'status_sent' => [
        'subject' => 'Il tuo ordine è stato spedito — Pointet',
        'paragraphs' => [
            'Buone notizie: il tuo ordine è stato affidato al corriere.',
            'Se è disponibile un link di tracciamento, te lo invieremo via e-mail.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Vedi il tuo ordine',
    ],
    'status_delivered' => [
        'subject' => 'Il tuo ordine è stato consegnato — Pointet',
        'paragraphs' => [
            'Secondo i nostri dati, il tuo ordine è stato consegnato.',
            'Speriamo che ti piaccia. Se qualcosa non va, contattaci.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Vedi il tuo ordine',
    ],
    'status_reported' => [
        'subject' => 'È stato segnalato un problema con il tuo ordine — Pointet',
        'paragraphs' => [
            'È stato segnalato un problema con il tuo ordine e lo stiamo verificando.',
            'Ti contatteremo non appena avremo novità.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Vedi il tuo ordine',
    ],
    'status_cancelled' => [
        'subject' => 'Il tuo ordine è stato annullato — Pointet',
        'paragraphs' => [
            'Il tuo ordine è stato annullato.',
            'Per qualsiasi domanda, contattaci.',
        ],
        'reference' => 'Ordine n. :reference',
        'details' => 'Vedi il tuo ordine',
    ],
    'device' => [
        'subject' => 'Accesso da un nuovo dispositivo — Pointet',
        'paragraphs' => [
            'Abbiamo rilevato un accesso al tuo account Pointet da un nuovo dispositivo.',
            'Se non riconosci questo accesso, cambia la password ed esci da tutti i dispositivi.',
        ],
        'browser' => 'Browser: :browser',
        'os' => 'Sistema operativo: :os',
    ],
    'welcome' => [
        'subject' => 'Benvenuto su Pointet!',
        'paragraphs' => [
            'Il tuo indirizzo e-mail è stato verificato e il tuo account Pointet è pronto.',
            'Ora puoi esplorare i nostri prodotti e gestire i tuoi ordini.',
        ],
    ],
];

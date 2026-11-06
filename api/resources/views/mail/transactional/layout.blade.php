<!doctype html>
<html lang="{{ $language }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;color:#27272a;font:16px/1.55 Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center" style="padding:20px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff">
            <tr><td bgcolor="#ffa2a2" style="padding:18px 20px;background-color:#ffa2a2;color:#27272a;font: bold 21px/1.2 Arial,sans-serif">
                <img src="{{ $message->embed(resource_path('views/mail/transactional/pointet-wordmark.png')) }}" width="106" height="20" alt="Pointet" style="display:block;border:0;color:#27272a">
            </td></tr>
            <tr><td style="padding:20px">@yield('content')</td></tr>
            <tr><td style="padding:16px 20px;border-top:1px solid #e4e4e7;color:#52525b;font-size:14px">{{ __('transactional_mail.signature') }}</td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>

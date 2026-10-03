<!doctype html>
<html lang="en">
<body style="font-family:Arial,sans-serif;color:#1d1d1f;line-height:1.5">
    <h1>Confirm your new email address</h1>
    <p>Use this code to confirm the email address for your account. It expires in {{ config('auth_tokens.email_change_code_ttl_minutes') }} minutes.</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">{{ $verificationCode }}</p>
    <p>If you did not request this change, you can ignore this email.</p>
</body>
</html>

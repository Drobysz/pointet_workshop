<!doctype html>
<html lang="en">
<body style="font-family:Arial,sans-serif;color:#1d1d1f;line-height:1.5">
    <h1>Confirm your email address</h1>
    <p>Use the link below to finish creating your account. It expires in 24 hours.</p>
    <p><a href="{{ $verificationUrl }}">Confirm email</a></p>
    <p>{{ $verificationUrl }}</p>
    <p>If you did not request this account, you can ignore this email.</p>
</body>
</html>


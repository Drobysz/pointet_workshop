<?php

return [
    'api_get' => (int) env('API_GET_RATE_LIMIT', 300),
    'api_write' => (int) env('API_WRITE_RATE_LIMIT', 120),
    'login' => (int) env('LOGIN_RATE_LIMIT', 10),
    'register' => (int) env('REGISTER_RATE_LIMIT', 10),
    'password_change' => (int) env('PASSWORD_CHANGE_RATE_LIMIT', 10),
    'email_change' => (int) env('EMAIL_CHANGE_RATE_LIMIT', 10),
    'email_verify' => (int) env('EMAIL_VERIFY_RATE_LIMIT', 10),
    'refresh' => (int) env('REFRESH_RATE_LIMIT', 60),
    'local_multiplier' => max(1, (int) env('LOCAL_API_RATE_LIMIT_MULTIPLIER', 10)),
];

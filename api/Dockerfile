FROM php:8.4-cli-alpine

RUN apk add --no-cache git icu-dev libzip-dev postgresql-dev unzip \
    && docker-php-ext-install intl opcache pdo_pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts
COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8000
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --no-reload --host=0.0.0.0 --port=8000"]

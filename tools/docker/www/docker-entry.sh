#!/bin/sh

export RELEASE_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

cd /var/www && php bin/console cache:clear
chmod -R 777 /var/www/var/cache

cd /var/www && php bin/console d:m:m --no-interaction

php-fpm &
nginx -g "daemon off;"

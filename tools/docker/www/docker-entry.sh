#!/bin/sh

export RELEASE_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

cd /var/www && php bin/console d:m:m --no-interaction --env=prod
cd /var/www && php bin/console assets:install --env=prod

# will have to do better than that
chmod -R 777 /var/www/var

cron &
php-fpm &
nginx -g "daemon off;"

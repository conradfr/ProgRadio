#!/bin/sh

export RELEASE_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

cd /app && php bin/console d:m:m --no-interaction --env=prod
cd /app && php bin/console assets:install --env=prod

# will have to do better than that
# etfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX var
#	setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX vart
chmod -R 777 /app/var

cron &
/usr/local/bin/frankenphp run --config /etc/caddy/Caddyfile
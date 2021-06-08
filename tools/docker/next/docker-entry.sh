#!/bin/sh

export RELEASE_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

php-fpm &
nginx -g "daemon off;"

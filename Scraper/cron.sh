#!/bin/sh
set -e
cd /var/www/progradio_prod/current/Scraper/
/usr/local/bin/node /var/www/progradio_prod/current/Scraper/index.js $1 $2
exit 0

# --------------- NODE ---------------

FROM node:lts-alpine as buildjs

WORKDIR /tmp
COPY ./spa/package.json /tmp
COPY ./spa/package-lock.json /tmp

RUN npm install

RUN mkdir /tmp/public/
RUN mkdir /tmp/public/assets/
RUN mkdir /tmp/public/.vite/

COPY ./spa /tmp

RUN npm run build

RUN ls /tmp

# --------------- PHP ---------------

FROM dunglas/frankenphp:1-php8.4

RUN mkdir -p /scripts
COPY ./tools/docker/www/docker-entry.sh /scripts

ARG USER=www-data
ENV TZ=Europe/Paris
ENV FRANKENPHP_CONFIG="worker ./public/index.php"

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    lsb-release

RUN wget -O - https://deb.goaccess.io/gnugpg.key | gpg --dearmor | tee /usr/share/keyrings/goaccess.gpg >/dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/goaccess.gpg arch=$(dpkg --print-architecture)] https://deb.goaccess.io/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/goaccess.list

# Install dependencies
RUN apt-get update && apt-get install -y \
    iputils-ping \
    netcat-traditional \
    build-essential \
    libpng-dev \
    libpq-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libgmp-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    zlib1g-dev \
    nginx \
    libxml2-dev \
    libwebp-dev \
    libcurl4-openssl-dev \
    jpegoptim \
    sudo \
    cron \
    goaccess

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# cron goaccess

ADD ./tools/docker/www/crontab /etc/cron.d/goaccess-cron
RUN chmod 0644 /etc/cron.d/goaccess-cron
RUN crontab /etc/cron.d/goaccess-cron

RUN touch /var/log/cron.log

RUN mkdir -p /var/log/caddy/
RUN touch /var/log/caddy/access.log

RUN printenv | sed 's/^\(.*\)$/export \1/g' > /root/project_env.sh

# Install extensions
RUN pecl install apcu \
 && docker-php-ext-install intl pdo_pgsql pgsql \
 && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --enable-gd \
 && docker-php-ext-install -j$(nproc) gd \
 && docker-php-ext-configure opcache --enable-opcache \
 && docker-php-ext-install opcache \
 && docker-php-ext-install gmp \
 && docker-php-ext-enable apcu \
 && pecl clear-cache

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY ./tools/docker/www/local.ini /usr/local/etc/php/conf.d/local.ini

RUN ls /usr/local/etc/php/conf.d
RUN cat /usr/local/etc/php/conf.d/local.ini
# RUN cat /usr/local/etc/php-fpm.d/fpm-supp.conf

# Expose port 80
EXPOSE 80

ARG APP_ENV=${APP_ENV}
ARG REDIS_URL=${REDIS_URL}
ARG MAILER_DSN=${MAILER_DSN}
ARG EMAIL_FROM=${EMAIL_FROM}
ARG EMAIL_TO=${EMAIL_TO}
ARG ANALYTICS=${ANALYTICS}
ARG STREAMS_PROXY=${STREAMS_PROXY}
ARG STREAMS_PROXY_KEY=${STREAMS_PROXY_KEY}
ARG DATABASE_URL=${DATABASE_URL}
ARG APP_SECRET=${APP_SECRET}
ARG ADSENSE_KEY=${ADSENSE_KEY}
ARG ADMOB_KEY=${ADMOB_KEY}
ARG ADSENSE_TAG_RADIO_HORIZ_KEY=${ADSENSE_TAG_RADIO_HORIZ_KEY}
ARG ADSENSE_TAG_RADIO_VERT_KEY=${ADSENSE_TAG_RADIO_VERT_KEY}
ARG ADSENSE_TAG_RADIO_VERT2_KEY=${ADSENSE_TAG_RADIO_VERT2_KEY}
ARG ADSENSE_TAG_RADIO_HORIZ_FIX_KEY=${ADSENSE_TAG_RADIO_HORIZ_FIX_KEY}
ARG GEOCODE=${GEOCODE}
ARG RECAPTCHA3_KEY=${RECAPTCHA3_KEY}
ARG RECAPTCHA3_SECRET=${RECAPTCHA3_SECRET}
ARG AMAZON_AFFILIATE_ID=${AMAZON_AFFILIATE_ID}
ARG ADMIN_API_URL=${ADMIN_API_URL}
ARG ADMIN_API_KEY=${ADMIN_API_KEY}
ARG CDN_BASE_URL=${CDN_BASE_URL}
ARG SENTRY_DSN=${SENTRY_DSN}
ARG MEILISEARCH_URL=${MEILISEARCH_URL}
ARG MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY}
ARG MEILISEARCH_PREFIX=${MEILISEARCH_PREFIX}

ENV APP_ENV=${APP_ENV} \
  REDIS_URL=${REDIS_URL} \
  MAILER_DSN=${MAILER_DSN} \
  EMAIL_FROM=${EMAIL_FROM} \
  EMAIL_TO=${EMAIL_TO} \
  ANALYTICS=${ANALYTICS} \
  STREAMS_PROXY=${STREAMS_PROXY} \
  STREAMS_PROXY_KEY=${STREAMS_PROXY_KEY} \
  DATABASE_URL=${DATABASE_URL} \
  APP_SECRET=${APP_SECRET} \
  ADSENSE_KEY=${ADSENSE_KEY} \
  ADMOB_KEY=${ADMOB_KEY} \
  ADSENSE_TAG_RADIO_HORIZ_KEY=${ADSENSE_TAG_RADIO_HORIZ_KEY} \
  ADSENSE_TAG_RADIO_VERT_KEY=${ADSENSE_TAG_RADIO_VERT_KEY} \
  ADSENSE_TAG_RADIO_VERT2_KEY=${ADSENSE_TAG_RADIO_VERT2_KEY} \
  ADSENSE_TAG_RADIO_HORIZ_FIX_KEY=${ADSENSE_TAG_RADIO_HORIZ_FIX_KEY} \
  GEOCODE=${GEOCODE} \
  RECAPTCHA3_KEY=${RECAPTCHA3_KEY} \
  RECAPTCHA3_SECRET=${RECAPTCHA3_SECRET} \
  AMAZON_AFFILIATE_ID=${AMAZON_AFFILIATE_ID} \
  ADMIN_API_URL=${ADMIN_API_URL} \
  ADMIN_API_KEY=${ADMIN_API_KEY} \
  MEILISEARCH_URL=${MEILISEARCH_URL} \
  MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY} \
  MEILISEARCH_PREFIX=${MEILISEARCH_PREFIX} \
  SENTRY_DSN=${SENTRY_DSN} \
  CDN_BASE_URL=${CDN_BASE_URL} \
  SERVER_NAME=:80 \
  FRANKENPHP_CONFIG="worker /app/public/index.php" \
  APP_RUNTIME=Runtime\\FrankenPhpSymfony\\Runtime

# Caddy
COPY ./tools/docker/www/Caddyfile /etc/caddy/Caddyfile
COPY ./tools/docker/www/worker.Caddyfile /etc/caddy/worker.Caddyfile

# Copy vendors
COPY --chown=www-data:www-data ./composer.json /app/composer.json
COPY --chown=www-data:www-data ./composer.lock /app/composer.lock
COPY --chown=www-data:www-data ./symfony.lock /app/symfony.lock

# Set working directory
WORKDIR /app

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --prefer-dist --no-scripts --no-dev --no-interaction --no-autoloader && rm -rf /root/.composer

# Copy existing application directory
COPY --chown=www-data:www-data ./ /app/

RUN mkdir -p ./public/build/assets/
COPY --from=buildjs /tmp/public/build/assets/ ./public/build/assets/
COPY --from=buildjs /tmp/public/build/.vite/ ./public/build/.vite/

RUN composer dump-autoload --no-scripts --no-dev --optimize --classmap-authoritative

# RUN mkdir -p /app/var/
# RUN mkdir -p /app/var/cache/
# RUN mkdir -p /app/var/cache/prod/
RUN mkdir -p /app/var/logs/
RUN mkdir -p /app/var/log/

RUN rm -rf /app/public/media
RUN ln -s /var/shared/media /app/public/

#RUN chown -R www-data:www-data /var/shared/media
#RUN chown -R www-data:www-data /app/var/
# RUN chmod -R 777 /app/vendor
RUN chmod -R 777 /app/var
# RUN chmod -R 777 /var/shared/

RUN \
	# Add additional capability to bind to port 80 and 443
	setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/frankenphp; \
	# Give write access to /data/caddy and /config/caddy
	chown -R ${USER}:${USER} /data/caddy && chown -R ${USER}:${USER} /config/caddy

#USER ${USER}
RUN usermod -u 1000 www-data

HEALTHCHECK CMD wget localhost:80 || exit 1

WORKDIR /scripts
RUN chmod +x ./docker-entry.sh
CMD ["./docker-entry.sh"]

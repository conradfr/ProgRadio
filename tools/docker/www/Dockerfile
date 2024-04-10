# --------------- NODE ---------------

FROM node:18-alpine as buildjs

WORKDIR /tmp
COPY ./package.json /tmp
COPY ./package-lock.json /tmp
COPY ./tsconfig.json /tmp
COPY ./env.d.ts /tmp

RUN npm i caniuse-lite browserslist
RUN npx update-browserslist-db@latest
RUN npm install

RUN mkdir /tmp/public/
COPY ./public /tmp/public
COPY ./buildjs /tmp/buildjs

RUN npm run build

RUN ls /tmp

# --------------- PHP ---------------

FROM php:8.2-fpm

RUN mkdir -p /scripts
COPY ./tools/docker/www/docker-entry.sh /scripts

ENV TZ=Europe/Paris

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

RUN printenv | sed 's/^\(.*\)$/export \1/g' > /root/project_env.sh

# nginx

COPY ./tools/docker/www/app.conf /etc/nginx/conf.d/app.conf
# RUN ls /etc/nginx/conf.d
COPY ./tools/docker/www/fpm-supp.conf /usr/local/etc/php-fpm.d/fpm-supp.conf

RUN rm -rf /etc/nginx/sites-enabled
RUN mkdir -p /etc/nginx/sites-enabled

# Install extensions
RUN pecl install apcu \
 && docker-php-ext-install intl pdo_pgsql pgsql \
 && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --enable-gd \
 && docker-php-ext-install -j$(nproc) gd \
 && docker-php-ext-configure opcache --enable-opcache \
 && docker-php-ext-install opcache \
 && docker-php-ext-enable apcu \
 && pecl clear-cache

COPY ./tools/docker/www/local.ini /usr/local/etc/php/conf.d/local.ini

RUN ls /usr/local/etc/php/conf.d
RUN cat /usr/local/etc/php/conf.d/local.ini
RUN cat /usr/local/etc/php-fpm.d/fpm-supp.conf

# Expose port 80
EXPOSE 80

ARG APP_ENV=${APP_ENV}
ARG REDIS_URL=${REDIS_URL}
ARG MAILER_DSN=${MAILER_DSN}
ARG EMAIL_FROM=${EMAIL_FROM}
ARG EMAIL_TO=${EMAIL_TO}
ARG analytics=${analytics}
ARG streams_proxy=${streams_proxy}
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

ENV APP_ENV=${APP_ENV} \
  REDIS_URL=${REDIS_URL} \
  MAILER_DSN=${MAILER_DSN} \
  EMAIL_FROM=${EMAIL_FROM} \
  EMAIL_TO=${EMAIL_TO} \
  analytics=${analytics} \
  streams_proxy=${streams_proxy} \
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
  AMAZON_AFFILIATE_ID=${AMAZON_AFFILIATE_ID}

# Copy vendors
COPY --chown=www-data:www-data ./composer.json /var/www/composer.json
COPY --chown=www-data:www-data ./composer.lock /var/www/composer.lock
COPY --chown=www-data:www-data ./symfony.lock /var/www/symfony.lock

# Set working directory
WORKDIR /var/www

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --prefer-dist --no-scripts --no-dev --no-interaction --no-autoloader && rm -rf /root/.composer

# Copy existing application directory
COPY --chown=www-data:www-data ./ /var/www/

COPY --from=buildjs /tmp/public/build/ ./public/build/

RUN composer dump-autoload --no-scripts --no-dev --optimize --classmap-authoritative

# RUN mkdir -p /var/www/var/
# RUN mkdir -p /var/www/var/cache/
# RUN mkdir -p /var/www/var/cache/prod/
RUN mkdir -p /var/www/var/logs/
RUN mkdir -p /var/www/var/log/

RUN rm -rf /var/www/public/media
RUN rm -rf /var/www/public/vue
RUN rm -rf /var/www/public/sass
RUN ln -s /var/shared/media /var/www/public/

#RUN chown -R www-data:www-data /var/shared/media
#RUN chown -R www-data:www-data /var/www/var/
# RUN chmod -R 777 /var/www/vendor
RUN chmod -R 777 /var/www/var
# RUN chmod -R 777 /var/shared/

RUN usermod -u 1000 www-data

WORKDIR /scripts
RUN chmod +x ./docker-entry.sh
CMD ["./docker-entry.sh"]

# --------------- NODE ---------------

FROM node:12.20.1 as buildjs

WORKDIR /tmp
RUN mkdir /tmp/public/
COPY ./package.json /tmp
COPY ./yarn.lock /tmp
COPY ./public /tmp/public
COPY ./buildjs /tmp/buildjs

RUN yarn install
RUN npm run build

RUN ls /tmp

# --------------- PHP ---------------

FROM php:8-fpm

RUN mkdir -p /scripts
COPY ./tools/docker/www/docker-entry.sh /scripts

# Install dependencies
RUN apt-get update && apt-get install -y \
    iputils-ping \
    netcat \
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
    jpegoptim

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# nginx

COPY ./tools/docker/www/app.conf /etc/nginx/conf.d/app.conf
# RUN ls /etc/nginx/conf.d
COPY ./tools/docker/www/fpm-supp.conf /usr/local/etc/php-fpm.d/fpm-supp.conf

RUN rm -rf /etc/nginx/sites-enabled
RUN mkdir -p /etc/nginx/sites-enabled

# Install extensions
RUN docker-php-ext-install intl pdo_pgsql pgsql \
 && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --enable-gd \
 && docker-php-ext-install -j$(nproc) gd \
 && docker-php-ext-configure opcache --enable-opcache \
 && docker-php-ext-install opcache

COPY ./tools/docker/www/local.ini /usr/local/etc/php/conf.d/local.ini

RUN ls /usr/local/etc/php/conf.d
RUN cat /usr/local/etc/php/conf.d/local.ini
RUN cat /usr/local/etc/php-fpm.d/fpm-supp.conf

# Expose port 80
EXPOSE 80

ARG APP_ENV=${APP_ENV}
ARG REDIS_URL=${REDIS_URL}
ARG MAILER_DSN=${MAILER_DSNL}
ARG analytics=${analytics}
ARG streams_proxy=${streams_proxy}
ARG DATABASE_URL=${DATABASE_URL}
ARG APP_SECRET=${APP_SECRET}

ENV APP_ENV=${APP_ENV} \
  REDIS_URL=${REDIS_URL} \
  MAILER_DSN=${MAILER_DSNL} \
  analytics=${analytics} \
  streams_proxy=${streams_proxy} \
  DATABASE_URL=${DATABASE_URL} \
  APP_SECRET=${APP_SECRET}

# Set working directory
WORKDIR /var/www

#RUN ping 10.0.1.8

#RUN (printf "PING\r\n";) | nc 10.0.1.8 6379

# Copy existing application directory
COPY --chown=www-data:www-data ./ /var/www/

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --no-interaction -o

COPY --from=buildjs /tmp/public/build/ ./public/build/

# RUN mkdir -p /var/www/var/
# RUN mkdir -p /var/www/var/cache/
# RUN mkdir -p /var/www/var/cache/prod/
RUN mkdir -p /var/www/var/logs/
RUN mkdir -p /var/www/var/log/

RUN rm -rf /var/www/public/media
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

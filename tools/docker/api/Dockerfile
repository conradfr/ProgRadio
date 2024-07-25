FROM hexpm/elixir:1.16.3-erlang-26.2.5.1-ubuntu-jammy-20240530

EXPOSE 80

ARG DEBIAN_FRONTEND=noninteractive

ARG DATABASE_URL=${DATABASE_URL}
ARG PORT=${PORT}
ARG HOST=${HOST}
ARG SECRET_KEY_BASE=${SECRET_KEY_BASE}
ARG REDIS_HOST=${REDIS_HOST}
ARG REDIS_DB=${REDIS_DB}
ARG REDIS_PASSWORD=${REDIS_PASSWORD}
ARG MEDIA_PATH=${MEDIA_PATH}
ARG MIX_ENV=${MIX_ENV}
ARG ORIGIN=${ORIGIN}
ARG CORS=${CORS}
ARG TZ=${TZ}
ARG PHX_SERVER=${PHX_SERVER}
ARG IP_BAN=${IP_BAN}
ARG PUBSUB_POOL_SIZE=${PUBSUB_POOL_SIZE}

ENV DATABASE_URL=${DATABASE_URL} \
    PORT=${PORT} \
    HOST=${HOST} \
    SECRET_KEY_BASE=${SECRET_KEY_BASE} \
    MIX_ENV=${MIX_ENV} \
    REDIS_HOST=${REDIS_HOST} \
    REDIS_DB=${REDIS_DB} \
    REDIS_PASSWORD=${REDIS_PASSWORD} \
    MEDIA_PATH=${MEDIA_PATH} \
    ORIGIN=${ORIGIN} \
    CORS=${CORS} \
    TZ=${TZ} \
    PHX_SERVER=${PHX_SERVER} \
    IP_BAN=${IP_BAN} \
    PUBSUB_POOL_SIZE=${PUBSUB_POOL_SIZE}

#RUN usermod -u 1000 root
#USER www-data

RUN apt-get update && apt-get install --no-install-suggests -y \
    tzdata \
    build-essential make \
    imagemagick \
    pkgconf \
    libicu-dev \
    jpegoptim optipng pngquant gifsicle

# For temp forked dep
RUN apt-get install --no-install-recommends --no-install-suggests -y git ca-certificates

RUN pkg-config --libs icu-uc icu-io

RUN mkdir -p /var/progradio_api
# RUN mkdir -p /var/www

COPY  ./progradio_api/mix.* /var/progradio_api/
COPY  ./progradio_api/config /var/progradio_api/config/

WORKDIR /var/progradio_api/

#RUN rm -Rf _build && \
RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix deps.get --only prod

RUN mix deps.compile --skip-local-deps

COPY  ./progradio_api /var/progradio_api/

RUN mix deps.compile

RUN mix release prod

HEALTHCHECK CMD wget 127.0.0.1:80 || exit 1

CMD ["_build/prod/rel/prod/bin/prod", "start"]

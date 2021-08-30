FROM hexpm/elixir:1.12.2-erlang-24.0.5-ubuntu-bionic-20210325

EXPOSE 80

ARG DATABASE_URL=${DATABASE_URL}
ARG PORT=${PORT}
ARG SECRET_KEY_BASE=${SECRET_KEY_BASE}
ARG REDIS_HOST=${REDIS_HOST}
ARG REDIS_DB=${REDIS_DB}
ARG REDIS_PASSWORD=${REDIS_PASSWORD}
ARG MEDIA_PATH=${MEDIA_PATH}
ARG MIX_ENV=${MIX_ENV}
ARG ORIGIN=${ORIGIN}
ARG CORS=${CORS}
ARG TZ=${TZ}

ENV DATABASE_URL=${DATABASE_URL} \
    PORT=${PORT} \
    SECRET_KEY_BASE=${SECRET_KEY_BASE} \
    MIX_ENV=${MIX_ENV} \
    REDIS_HOST=${REDIS_HOST} \
    REDIS_DB=${REDIS_DB} \
    REDIS_PASSWORD=${REDIS_PASSWORD} \
    MEDIA_PATH=${MEDIA_PATH} \
    ORIGIN=${ORIGIN} \
    CORS=${CORS} \
    TZ=${TZ}

#RUN usermod -u 1000 root
#USER www-data

RUN mkdir -p /var/progradio_api
RUN mkdir -p /var/www

COPY  ./progradio_api/config /var/progradio_api/config/
COPY  ./progradio_api/mix.* /var/progradio_api/

WORKDIR /var/progradio_api/

RUN apt-get update && apt-get install -y \
    imagemagick \
    jpegoptim optipng pngquant gifsicle

RUN rm -Rf _build && \
    mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get --only prod \
    mix deps.compile

COPY  ./progradio_api /var/progradio_api/

RUN mix release prod

CMD ["_build/prod/rel/prod/bin/prod", "start"]

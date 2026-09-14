# --------------- BUILD ---------------

FROM hexpm/elixir:1.20.4-erlang-29.0.6-ubuntu-jammy-20260810 AS builder

ARG DEBIAN_FRONTEND=noninteractive

# Build-time toolchain only. libicu-dev is needed to compile the ex_cldr_collation
# NIF; the runtime stage carries the matching shared library instead.
RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y \
    build-essential make \
    pkgconf \
    libicu-dev \
    git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pkg-config --libs icu-uc icu-io

# config/config.exs is evaluated while compiling and reads these, and runtime.exs
# does not override them, so they have to be set before `mix release`. Every other
# variable is read from runtime.exs at boot and lives in the runtime stage, where
# changing it cannot invalidate the dependency compile.
ARG MIX_ENV=${MIX_ENV}
ARG CDN_BASE_URL=${CDN_BASE_URL}
ARG CORS=${CORS}

ENV MIX_ENV=${MIX_ENV} \
    CDN_BASE_URL=${CDN_BASE_URL} \
    CORS=${CORS}

RUN mkdir -p /var/progradio_api

WORKDIR /var/progradio_api/

COPY  ./progradio_api/mix.* /var/progradio_api/

RUN mix local.hex --force
RUN mix local.rebar --force

# GitHub rate-limits unauthenticated clones, which breaks the forked git deps in
# mix.exs. Those repos are public, so a token with NO scopes at all is enough.
# Deliberately not promoted to ENV: it is only needed by deps.get, never at
# runtime. Set it as a CapRover build argument.
# Note: GitHub silently ignores an invalid token for public reads, so a bad or
# expired one does not fail the build, it just makes you anonymous again.
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      export GIT_CONFIG_COUNT=1 \
             GIT_CONFIG_KEY_0="url.https://x-access-token:${GITHUB_TOKEN}@github.com/.insteadOf" \
             GIT_CONFIG_VALUE_0="https://github.com/"; \
    fi; \
    mix deps.get --only prod

# deps.get does not read config, so the config copy sits below it: editing config
# then costs a recompile, not a re-download.
COPY  ./progradio_api/config /var/progradio_api/config/

RUN mix deps.compile --skip-local-deps

COPY  ./progradio_api /var/progradio_api/

RUN mix deps.compile

RUN mix release prod

# --------------- RUNTIME ---------------

FROM ubuntu:jammy

EXPOSE 80

ARG DEBIAN_FRONTEND=noninteractive

# libicu70 backs the ex_cldr_collation NIF compiled in the builder stage.
# imagemagick backs mogrify. The release bundles its own ERTS, so no Erlang or
# Elixir toolchain is needed here.
RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y \
    tzdata \
    ca-certificates \
    libicu70 \
    libssl3 \
    imagemagick \
    wget \
    jpegoptim optipng pngquant gifsicle \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/progradio_api/

COPY --from=builder /var/progradio_api/_build/prod/rel/prod /var/progradio_api/_build/prod/rel/prod

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
ARG BAN_IP=${BAN_IP}
ARG PUBSUB_POOL_SIZE=${PUBSUB_POOL_SIZE}
ARG RELEASE_COOKIE=${RELEASE_COOKIE}
ARG AUTH_USERNAME=${AUTH_USERNAME}
ARG AUTH_PASSWORD=${AUTH_PASSWORD}
ARG SENTRY_DSN=${SENTRY_DSN}
ARG PROGRADIO_API_WEBHOOK_SECRET=${PROGRADIO_API_WEBHOOK_SECRET}
ARG PROGRADIO_API_WEBHOOK_URL=${PROGRADIO_API_WEBHOOK_URL}
ARG AZURE_GPT_BASE_URL=${AZURE_GPT_BASE_URL}
ARG AZURE_GPT_DEPLOYMENT=${AZURE_GPT_DEPLOYMENT}
ARG AZURE_GPT_VERSION=${AZURE_GPT_VERSION}
ARG AZURE_GPT_API_KEY=${AZURE_GPT_API_KEY}
ARG API_50K_KEY=${API_50K_KEY}
ARG CDN_BASE_URL=${CDN_BASE_URL}
ARG FETCHER_URL=${FETCHER_URL}
ARG FETCHER_TOKEN=${FETCHER_TOKEN}

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
    BAN_IP=${BAN_IP} \
    RELEASE_COOKIE=${RELEASE_COOKIE} \
    AUTH_USERNAME=${AUTH_USERNAME} \
    AUTH_PASSWORD=${AUTH_PASSWORD} \
    SENTRY_DSN=${SENTRY_DSN} \
    PUBSUB_POOL_SIZE=${PUBSUB_POOL_SIZE} \
    PROGRADIO_API_WEBHOOK_SECRET=${PROGRADIO_API_WEBHOOK_SECRET} \
    PROGRADIO_API_WEBHOOK_URL=${PROGRADIO_API_WEBHOOK_URL} \
    AZURE_GPT_BASE_URL=${AZURE_GPT_BASE_URL} \
    AZURE_GPT_DEPLOYMENT=${AZURE_GPT_DEPLOYMENT} \
    AZURE_GPT_VERSION=${AZURE_GPT_VERSION} \
    AZURE_GPT_API_KEY=${AZURE_GPT_API_KEY} \
    API_50K_KEY=${API_50K_KEY} \
    CDN_BASE_URL=${CDN_BASE_URL} \
    FETCHER_URL=${FETCHER_URL} \
    FETCHER_TOKEN=${FETCHER_TOKEN}

#RUN usermod -u 1000 root
#USER www-data

HEALTHCHECK CMD wget localhost:80/health || exit 1

CMD ["_build/prod/rel/prod/bin/prod", "start"]

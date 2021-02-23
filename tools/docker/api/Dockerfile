FROM elixir:latest

EXPOSE 80

ARG DATABASE_URL=${DATABASE_URL}
ARG PORT=${PORT}
ARG SECRET_KEY_BASE=${SECRET_KEY_BASE}
ARG REDIS_HOST=${REDIS_HOST}
ARG REDIS_DB=${REDIS_DB}
ARG REDIS_PASSWORD=${REDIS_PASSWORD}
ARG MIX_ENV=${MIX_ENV}

ENV DATABASE_URL=${DATABASE_URL} \
    PORT=${PORT} \
    SECRET_KEY_BASE=${SECRET_KEY_BASE} \
    MIX_ENV=${MIX_ENV} \
    REDIS_HOST=${REDIS_HOST} \
    REDIS_DB=${REDIS_DB} \
    REDIS_PASSWORD=${REDIS_PASSWORD} \
    TZ=Europe/Paris

COPY ./progradio_api .

RUN rm -Rf _build && \
    mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get --only prod && \
    mix release prod --overwrite

CMD ["_build/prod/rel/prod/bin/prod", "start"]

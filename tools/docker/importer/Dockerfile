FROM elixir:latest

# COPY ./Importer /usr/src/myapp

COPY ./Importer .

ENV MIX_ENV=prod

RUN rm -Rf _build && \
    mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get && \
    mix release prod --overwrite

CMD ["_build/prod/rel/prod/bin/prod", "start"]

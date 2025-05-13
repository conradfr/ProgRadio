ProgRadio
=========

https://www.programmes-radio.com

https://www.radio-addict.com

Dependencies
--------------
- PHP 8.4.x / Symfony 7.x
- TypeScript 4.8 / VueJs 3.5+
- NodeJS v20.x (spa & new scraper) & v14.x (old scraper)
- Elixir 1.18.x (Api / Importer)
- PostgreSQL 17 & Redis
- Meilisearch
- Nginx (dev), Caddy & FrankenPHP (prod)
- ImageMagick
- CapRover (Docker deployment)
- Docker compose (dev)

Run
--------------
**Scraper**: cd Scraper && node index.js

**Api / Importer**: cd progradio_api && iex -S mix phx.server (dev)

**Vue app**: npm run build / npm run dev

Run (docker compose) (dev)
--------------
**SSL certs**: openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certs/nginx.key -out ./certs/nginx.crt

**SETUP**: make build / make up / make down

**PHP deps**: make composer c=install

**Scraper**: make scrap c='-r RADIO'

*Api / Importer**: make api-dev

**Vue app**: make spa-dev

Architecture
--------------

![Flowchart](docs/ArchitectureFlowchart.png)


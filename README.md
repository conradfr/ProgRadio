ProgRadio
=========

https://www.programmes-radio.com
https://www.radio-addict.com

Dependencies
--------------
- PHP 8.3.x / Symfony 7.x
- TypeScript 4.8 / VueJs 3.1+
- NodeJS v14.x
- Elixir 1.17.x (Api / Importer)
- PostgreSQL 14 & Redis
- Nginx or Apache
- ImageMagick
- CapRover & Docker (deployment)

Run
--------------
**Scraper**: cd Scraper && node index.js

**Api / Importer**: cd progradio_api && iex -S mix phx.server (dev)

**Vue app**: npm run build / npm run dev

Run (docker compose) (dev)
--------------
**PHP deps**: make composer c=install

**Scraper**: docker compose run --service-ports scraper node index.js

*Api / Importer**: docker compose run --service-ports api iex -S mix phx.server

**Vue app**: docker exec progradio-spa-1 npm run dev

Architecture
--------------

![Flowchart](docs/ArchitectureFlowchart.png)


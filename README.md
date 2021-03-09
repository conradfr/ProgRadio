ProgRadio
=========

https://www.programmes-radio.com

Dependencies
--------------
- VueJs 2.x
- PHP 8.0 / Symfony 5.2
- NodeJS v10+ (Scraper)
- Elixir 1.11+ (Api / Importer)
- PostgreSQL & Redis
- Nginx or Apache
- ImageMagick
- CapRover & docker (deployment)

Run
--------------
**Scraper**: cd Scraper && node index.js

**Api / Importer**: cd progradio_api && iex -S mix phx.server (dev)

**Vue app**: npm run build / npm run dev

Architecture
--------------

![Flowchart](docs/ArchitectureFlowchart.png)


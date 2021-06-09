ProgRadio
=========

https://www.programmes-radio.com

Dependencies
--------------
- PHP 8.0.x / Symfony 5.2
- VueJs 2.x
- NodeJS v12.x (Scraper)
- Elixir 1.12.x (Api / Importer)
- PostgreSQL & Redis
- Nginx or Apache
- ImageMagick
- CapRover & Docker (deployment)

Run
--------------
**Scraper**: cd Scraper && node index.js

**Api / Importer**: cd progradio_api && iex -S mix phx.server (dev)

**Vue app**: npm run build / npm run dev

Architecture
--------------

![Flowchart](docs/ArchitectureFlowchart.png)


ProgRadio
=========

https://www.programmes-radio.com
https://www.radio-addict.com

Dependencies
--------------
- PHP 8.1.x / Symfony 6.1
- TypeScript 4.8 / VueJs 3.1+
- NodeJS v14.x
- Elixir 1.13.x (Api / Importer)
- PostgreSQL 14 & Redis
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


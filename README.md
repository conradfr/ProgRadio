ProgRadio
=========

https://www.programmes-radio.io

Dependencies
--------------
- VueJs 2.x
- PHP 7.4 / Symfony 5.x
- NodeJS v10+ (Scraper)
- Elixir 1.9+ (Importer)
- PostgreSQL & Redis
- Nginx or Apache
- Capistrano 3 (deployment)
- ImageMagick

Run
--------------
**Scraper**: cd Scraper && node index.js

**Importer**: cd Importer && iex -S mix (dev)

Architecture
--------------

![Flowchart](docs/ProgRadioFlowchart.png)


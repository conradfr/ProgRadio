ProgRadio
=========

https://www.programmes-radio.io

Dependencies
--------------
- VueJs 2
- PHP 7.2 / Symfony 4.3
- NodeJS v8+ (Scraper)
- Elixir 1.9+ (Importer)
- PostgreSQL & Redis
- Nginx or Apache
- Capistrano 3 (deployment)

Run
--------------
**Scraper**: cd Scraper && node index.js

**Importer**: cd Importer && iex -S mix (dev)

Architecture
--------------

![Flowchart](docs/ProgRadioFlowchart.png)


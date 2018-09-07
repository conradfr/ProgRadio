ProgRadio
=========

http://www.programmes-radio.io

Dependencies
--------------
- VueJs 2
- PHP 7.1 / Symfony 3.4
- NodeJS (Scraper)
- Elixir 1.7+ (Importer)
- PosgreSQL / Redis
- Nginx or Apache
- Capistrano (deployment)

Run
--------------
**Scraper**: cd Scraper && node index.js

*Importer**: cd Importer && iex -S mix (dev)

Architecture
--------------

![Flowchart](docs/ProgRadioFlowchart.png)


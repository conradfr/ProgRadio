# Executables (local)
DOCKER_COMP = docker compose

# Docker containers
PHP_CONT = $(DOCKER_COMP) exec php-fpm
SPA_CONT = $(DOCKER_COMP) exec spa
API_CONT = $(DOCKER_COMP) exec api
DB_CONT = $(DOCKER_COMP) exec database
SCRAPER_CONT = $(DOCKER_COMP) exec scraper
SCRAPER2_CONT = $(DOCKER_COMP) exec scraper2

# Executables
PHP = $(PHP_CONT) php
COMPOSER = $(PHP_CONT) composer
SYMFONY = $(PHP) bin/console
MIX	= $(API_CONT) mix
NPM	= $(SPA_CONT) npm

# Misc
.DEFAULT_GOAL = help
.PHONY        : help build up start down logs sh composer vendor sf cc test

## —— 🎵 🐳 The Symfony Docker Makefile 🐳 🎵 ——————————————————————————————————
help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Docker 🐳 ————————————————————————————————————————————————————————————————
build: ## Builds the Docker images
	@$(DOCKER_COMP) build --pull --no-cache

up: ## Start the docker hub in detached mode (no logs)
	@$(DOCKER_COMP) up --detach

start: build up ## Build and start the containers

down: ## Stop the docker hub
	@$(DOCKER_COMP) down --remove-orphans

stop: down

logs: ## Show live logs
	@$(DOCKER_COMP) logs --tail=0 --follow

sh: ## Connect to the FrankenPHP container
	@$(PHP_CONT) sh

bash: ## Connect to the FrankenPHP container via bash so up and down arrows go to previous commands
	@$(PHP_CONT) bash

test: ## Start tests with phpunit, pass the parameter "c=" to add options to phpunit, example: make test c="--group e2e --stop-on-failure"
	@$(eval c ?=)
	@$(DOCKER_COMP) exec -e APP_ENV=test php-fpm bin/phpunit $(c)

## —— DB ———————————————————————————————————————————————————————————————

db-import:
	@$(DB_CONT) psql -d postgres -U postgres -c "DROP DATABASE IF EXISTS progradio;"
	@$(DB_CONT) psql -d postgres -U postgres -c "CREATE DATABASE progradio;"
	@$(DB_CONT) sh -c 'cat /var/tmp/sql/* | psql -d progradio -U postgres'

## —— API ———————————————————————————————————————————————————————————————

api-dev:
	@$(API_CONT) iex -S mix phx.server

## —— JS FRONT ———————————————————————————————————————————————————————————————

spa-dev:
	@$(SPA_CONT) npm run dev

## —— SCRAPER ———————————————————————————————————————————————————————————————

scrap:
	@$(eval c ?=)
	@$(SCRAPER_CONT) node index.js $(c)

scrap2:
	@$(eval c ?=)
	@$(SCRAPER2_CONT) node index.js $(c)

## —— Composer 🧙 ——————————————————————————————————————————————————————————————
composer: ## Run composer, pass the parameter "c=" to run a given command, example: make composer c='req symfony/orm-pack'
	@$(eval c ?=)
	@$(COMPOSER) $(c)

vendor: ## Install vendors according to the current composer.lock file
vendor: c=install --prefer-dist --no-dev --no-progress --no-scripts --no-interaction
vendor: composer

## —— Symfony 🎵 ———————————————————————————————————————————————————————————————
sf: ## List all Symfony commands or pass the parameter "c=" to run a given command, example: make sf c=about
	@$(eval c ?=)
	@$(SYMFONY) $(c)

cc: c=c:c ## Clear the cache
cc: sf

## —— Mix 🧙 ——————————————————————————————————————————————————————————————
mix: ## Run mix, pass the parameter "c=" to run a given command, example: make mix c='deps.get'
	@$(eval c ?=)
	@$(MIX) $(c)

## —— Npm 🧙 ——————————————————————————————————————————————————————————————
npm: ## Run npm, pass the parameter "c=" to run a given command, example: make npm c='update'
	@$(eval c ?=)
	@$(NPM) $(c)

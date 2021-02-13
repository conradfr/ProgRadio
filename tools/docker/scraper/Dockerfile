FROM node:10.23.3

RUN apt-get update \
    && apt-get -y install \
    cron \
    libxml2-dev

ADD ./tools/docker/scraper/crontab /etc/cron.d/scraper-cron
RUN chmod 0644 /etc/cron.d/scraper-cron

RUN touch /var/log/cron.log

WORKDIR /home/node/app

# Copy existing application directory
COPY ./Scraper .
COPY ./tools/docker/scraper/scraper_parameters.yml .

# Install dependencies
RUN yarn install

CMD cron && tail -f /var/log/cron.log

FROM node:14.17.6

ENV TZ=Europe/Paris

ARG MAIL_PASSWORD=${MAIL_PASSWORD}
ARG MAIL_USERNAME=${MAIL_USERNAME}
ARG MAILER_DSN=${MAILER_DSNL}
ARG MAIL_HOST=${MAIL_HOST}
ARG MAIL_PORT=${MAIL_PORT}
ARG MAIL_TO=${MAIL_TO}
ARG API_KEY=${API_KEY}
ARG API_SCHEDULE_URL=${API_SCHEDULE_URL}
ARG API_RADIOS_URL=${API_RADIOS_URL}
ARG NODE_ENV=${NODE_ENV}
ARG PROXY_URL=${PROXY_URL}
ARG PROXY_KEY=${PROXY_KEY}

ENV MAIL_PASSWORD=${MAIL_PASSWORD} \
    MAIL_USERNAME=${MAIL_USERNAME} \
    MAILER_DSN=${MAILER_DSNL} \
    MAIL_HOST=${MAIL_HOST} \
    MAIL_PORT=${MAIL_PORT} \
    MAIL_TO=${MAIL_TO} \
    API_KEY=${API_KEY} \
    API_SCHEDULE_URL=${API_SCHEDULE_URL} \
    API_RADIOS_URL=${API_RADIOS_URL} \
    NODE_ENV=${NODE_ENV} \
    PROXY_URL=${PROXY_URL} \
    PROXY_KEY=${PROXY_KEY}

RUN apt-get update \
    && apt-get -y install \
    cron \
    libxml2-dev

ADD ./tools/docker/scraper/crontab /etc/cron.d/scraper-cron
RUN chmod 0644 /etc/cron.d/scraper-cron
RUN crontab /etc/cron.d/scraper-cron

RUN touch /var/log/cron.log

RUN printenv | sed 's/^\(.*\)$/export \1/g' > /root/project_env.sh

WORKDIR /home/node/app

# Copy existing application directory
COPY ./Scraper .
COPY ./tools/docker/scraper/scraper_parameters.yml .

# Install dependencies
RUN yarn install

CMD cron && tail -f /var/log/cron.log
# CMD ["cron"]

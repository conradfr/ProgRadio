FROM node:18-alpine

RUN mkdir -p /scripts
COPY ./tools/docker/proxy/docker-entry.sh /scripts

# Copy existing application directory
COPY ./streams-proxy /home/node/app

# RUN ls /home/node/app

# RUN ls -alh .

# Set working directory
WORKDIR /home/node/app

# Install dependencies
RUN npm install

# Expose port 80
EXPOSE 80

# RUN ls -alh .

# RUN rm -rf ./*

WORKDIR /scripts
RUN chmod +x ./docker-entry.sh
RUN ls .
CMD ["./docker-entry.sh"]

FROM node:latest

# Install cron...
RUN set -ex; \
        apt-get update; \
        apt-get install -y cron nano;

# Add the cron job
COPY extra/cron.job /etc/cron.d/cron.job
RUN chmod 0644 /etc/cron.d/cron.job
RUN touch /var/log/cron.log

WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy app files
COPY run.js extra/run_test.sh ./
RUN chmod 0544 run_test.sh
COPY libs ./libs
COPY phantom ./phantom

# Run the cron daemon and tail the log to keep the container running
CMD cron && tail -f /var/log/cron.log

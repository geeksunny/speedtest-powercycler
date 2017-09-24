FROM node:latest

# Install cron...
RUN set -ex; \
        apt-get update; \
        apt-get install -y cron nano;

# Add the cron job
COPY extra/cron.job /etc/cron.d/cron.job
RUN chmod 0644 /etc/cron.d/cron.job

WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json .
RUN npm install
# PhantomJS should get installed with the command above

# Copy app files
COPY powercycle.js run.js speedtest.js waiter.js phantom extra/run_test.sh .

# Run the cron daemon and tail the log to keep the container running
CMD cron && tail -f /var/log/cron.log
FROM node:18-bullseye

RUN apt-get update && apt-get install \
    sqlite3 

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm


# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch

WORKDIR /kevin/bot
ADD . ./
RUN pnpm install -r --offline

# setup application folders
RUN mkdir /log && mkdir /db

EXPOSE 8080
CMD ["/kevin/bot/entrypoint.sh"]
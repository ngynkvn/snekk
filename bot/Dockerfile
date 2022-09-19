FROM rust:1.63-bullseye as redisJSON
# build RedisJSON
RUN mkdir /modules
RUN git clone --recursive https://github.com/RedisJSON/RedisJSON.git && \
    cd RedisJSON && \ 
    ./sbin/setup && \
    make build && \
    cp ./bin/*release/rejson.so /modules

FROM node:18-bullseye as base

RUN apt-get update && apt-get install -y \
    sqlite3 \
    redis-server

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch

WORKDIR /kevin/bot
ADD . ./
RUN pnpm install -r --offline

# setup application folders
RUN mkdir /log && mkdir /db

COPY --from=redisJSON /modules /modules

FROM base as test
CMD ["npm", "run", "test"]

FROM base as development
ENTRYPOINT [ "/kevin/bot/entrypoint.sh" ]

FROM base as build
RUN npm run build

FROM build as production
EXPOSE 8080
CMD ["node", "build/index.js"]
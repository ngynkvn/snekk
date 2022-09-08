FROM node:18-bullseye as base

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

FROM base as test
CMD ["npm", "run", "test"]

FROM base as development
CMD ["npm", "run", "dev"]

FROM base as build
RUN npm run build

FROM build as production
EXPOSE 8080
CMD ["node", "build/index.js"]
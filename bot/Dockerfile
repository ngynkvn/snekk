FROM node:lts
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm


# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch

WORKDIR /kevin/bot
ADD . ./
RUN pnpm install -r --offline

# setup application folders
RUN mkdir /log

EXPOSE 8080
CMD ["npm", "start"]
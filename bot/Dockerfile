FROM node:lts
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm


# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

WORKDIR /kevin/bot
ADD . ./
RUN pnpm install -r --offline --prod

EXPOSE 8080
CMD ["npm", "start"]
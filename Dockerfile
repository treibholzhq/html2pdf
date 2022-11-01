# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine

FROM node:lts-alpine3.16 as base

ENV PUPPETEER_VERSION=14.1.2 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      msttcorefonts-installer \
    && update-ms-fonts \
    && fc-cache -f

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --immutable --immutable-cache --check-cache \
    && yarn add puppeteer-core@${PUPPETEER_VERSION} \
    && rm -f package.json yarn.lock

COPY src/index.mjs .

RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && chown -R pptruser:pptruser /home/pptruser /app

USER pptruser

ENTRYPOINT [ "node", "/app/index.mjs" ]

EXPOSE 5000

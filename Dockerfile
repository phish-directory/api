# THIS IS BROKEN RN

FROM node:21.7.1
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./

# install pnpm
RUN npm install -g pnpm

# install dependencies
RUN pnpm install

COPY . .

EXPOSE 3000
CMD [ "pnpm", "run", "start"]
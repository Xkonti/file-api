FROM oven/bun:latest

WORKDIR /usr/src/app

# Set default environment variables
ENV DATA_DIR /data
ENV NODE_ENV production

COPY package.json ./
COPY bun.lockb ./
RUN bun install

COPY . ./

EXPOSE 3000
CMD ["bun", "run", "prod"]
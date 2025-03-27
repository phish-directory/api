# syntax = docker/dockerfile:1

# Use the official Bun image
FROM oven/bun:1 AS base

LABEL fly_launch_runtime="Bun / Drizzle"

# App lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV BUN_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential openssl pkg-config python-is-python3

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bun run build

# Remove development dependencies
RUN bun install --production --frozen-lockfile

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "start" ]
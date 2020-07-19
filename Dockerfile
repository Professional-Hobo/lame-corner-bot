ARG NODE_VERSION=12

#        dependencies
# -------------------------
FROM node:${NODE_VERSION}-alpine AS deps

# Install latest build tooling for native addons
RUN apk add --no-cache alpine-sdk python

WORKDIR /app
COPY package-lock.json ./
COPY ./bin/package-build.js ./bin/

# Build a package.json from the lockfile
RUN ./bin/package-build.js

# Install prod deps and all deps separately for stage-specific usage
RUN npm ci
RUN cp -r ./node_modules ./dev_node_modules
RUN npm prune --prod

#           base
# -------------------------
FROM node:${NODE_VERSION}-alpine AS base

# Prevent node/npm being run as PID 1
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init"]

ENV PATH $PATH:./node_modules/.bin
WORKDIR /app
COPY . .
RUN chown -R node:node /app
USER node

#           dev
# -------------------------
FROM base AS dev
COPY --chown=node --from=deps /app/dev_node_modules ./node_modules
CMD ["nodemon"]

#          release
# -------------------------
FROM base AS release
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
RUN rm -rf test .eslintrc.json
CMD ["node", "."]

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# Set NODE_ENV to production for build
ENV NODE_ENV=production
# Skip strict environment validation during build time
ENV SKIP_ENV_VALIDATION=true

# Build with secret environment file mounted
# We mount the secret 'env_file' to /run/secrets/env_file
# Then we source it to export all variables before running build
RUN --mount=type=secret,id=env_file \
    set -a && \
    source /run/secrets/env_file && \
    set +a && \
    npm run build

# Stage 2: Create the final, small production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
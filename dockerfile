
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# Accept build arguments (non-sensitive public variables)
ARG NEXT_PUBLIC_APP_URL
ARG R2_PUBLIC_URL
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY

# Set public environment variables
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV NEXT_PUBLIC_R2_PUBLIC_URL=$NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY
ENV NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY
ENV NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY

# Set NODE_ENV to production for build
ENV NODE_ENV=production
# Skip strict environment validation during build time
ENV SKIP_ENV_VALIDATION=true

# Build with secrets mounted securely
# Secrets are available as files but we don't expose them in build logs
RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=better_auth_secret \
    --mount=type=secret,id=better_auth_base_url \
    --mount=type=secret,id=resend_api_key \
    --mount=type=secret,id=message_encryption_key \
    --mount=type=secret,id=stripe_secret_key \
    --mount=type=secret,id=stripe_webhook_secret \
    --mount=type=secret,id=r2_access_key_id \
    --mount=type=secret,id=r2_secret_access_key \
    --mount=type=secret,id=r2_account_id \
    --mount=type=secret,id=r2_public_bucket_name \
    --mount=type=secret,id=r2_private_bucket_name \
    export DATABASE_URL=$(cat /run/secrets/database_url) && \
    export BETTER_AUTH_SECRET=$(cat /run/secrets/better_auth_secret) && \
    export BETTER_AUTH_BASE_URL=$(cat /run/secrets/better_auth_base_url) && \
    export RESEND_API_KEY=$(cat /run/secrets/resend_api_key) && \
    export MESSAGE_ENCRYPTION_KEY=$(cat /run/secrets/message_encryption_key) && \
    export STRIPE_SECRET_KEY=$(cat /run/secrets/stripe_secret_key) && \
    export STRIPE_WEBHOOK_SECRET=$(cat /run/secrets/stripe_webhook_secret) && \
    export R2_ACCESS_KEY_ID=$(cat /run/secrets/r2_access_key_id) && \
    export R2_SECRET_ACCESS_KEY=$(cat /run/secrets/r2_secret_access_key) && \
    export R2_ACCOUNT_ID=$(cat /run/secrets/r2_account_id) && \
    export R2_PUBLIC_BUCKET_NAME=$(cat /run/secrets/r2_public_bucket_name) && \
    export R2_PRIVATE_BUCKET_NAME=$(cat /run/secrets/r2_private_bucket_name) && \
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
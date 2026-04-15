# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/storage/package.json ./packages/storage/package.json

RUN npm ci

COPY . .

# Set NODE_ENV to production for build
ENV NODE_ENV=production
# Skip strict environment validation during build time
ENV SKIP_ENV_VALIDATION=true

# Set placeholders for build time
ENV NEXT_PUBLIC_APP_URL=NEXT_PUBLIC_APP_URL_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PLACEHOLDER

# Stripe Price Placeholders
ENV NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY=NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY=NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY=NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY=NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY=NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY_PLACEHOLDER
ENV NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY=NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY_PLACEHOLDER

# Add a dummy database URL to satisfy any build-time constraints if they slip through
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Build without secrets
RUN npm run build

# Stage 2: Create the final, small production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (curl for healthchecks if needed, purely optional here)
RUN apk add --no-cache curl

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/storage ./packages/storage
COPY entrypoint.sh ./entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Set NODE_ENV to production
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
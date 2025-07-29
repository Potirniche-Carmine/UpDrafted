# Dockerfile

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# Add these two lines to make the database URL available during the build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Run the build command
RUN npm run build

# ---

# Stage 2: Create the final, small production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
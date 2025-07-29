# Dockerfile

# Stage 1: Build the application
# Use a specific Node.js version for consistency
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and lock files
COPY package.json ./
# Use package-lock.json if you have it, otherwise yarn.lock or pnpm-lock.yaml
COPY package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of your application's source code
COPY . .

# Run the build command
RUN npm run build

# ---

# Stage 2: Create the final, small production image
# Use the same base image for consistency
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the necessary files from the 'builder' stage
# This keeps the final image small and secure
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# The command to start the Next.js application in production mode
CMD ["npm", "start"]
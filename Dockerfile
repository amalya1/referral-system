# Build stage
FROM node:18-alpine AS builder

# Add curl for healthchecks
RUN apk --no-cache add curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

# Add curl for healthchecks
RUN apk --no-cache add curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built assets from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Set proper permissions
RUN chown -R nestjs:nodejs /app

# Use non-root user
USER nestjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start:prod"]

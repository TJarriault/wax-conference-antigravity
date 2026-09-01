# Stage 1: Dependency Installation & Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Runtime Environment
FROM node:22-alpine

WORKDIR /app

# Create non-root user & group if needed, Alpine node image has user 'node'
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node public ./public

USER node

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => { if (r.statusCode !== 200) process.exit(1); })"

CMD ["node", "server.js"]

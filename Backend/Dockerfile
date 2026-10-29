FROM node:22-alpine
WORKDIR /app

# OpenSSL is required by the Prisma engines on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 3002
# Sync the schema, then start the API
CMD ["sh", "-c", "npx prisma db push && node server.js"]

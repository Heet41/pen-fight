FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY prisma/schema.prisma ./prisma/

RUN npm install --workspace=backend --workspace=shared

# Copy source
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3001

CMD ["npm", "run", "dev", "--workspace=backend"]

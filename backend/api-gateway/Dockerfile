FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy API Gateway files
COPY api-gateway/package*.json ./api-gateway/
COPY api-gateway/tsconfig*.json ./api-gateway/
COPY api-gateway/nest-cli.json ./api-gateway/
COPY api-gateway/src ./api-gateway/src

WORKDIR /app/api-gateway

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build API Gateway
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/api-gateway/dist ./dist
COPY --from=build /app/api-gateway/node_modules ./node_modules
COPY --from=build /app/api-gateway/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

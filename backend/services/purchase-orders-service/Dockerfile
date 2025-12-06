FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/purchase-orders-service/package*.json ./services/purchase-orders-service/
COPY services/purchase-orders-service/tsconfig*.json ./services/purchase-orders-service/
COPY services/purchase-orders-service/nest-cli.json ./services/purchase-orders-service/
COPY services/purchase-orders-service/src ./services/purchase-orders-service/src

WORKDIR /app/services/purchase-orders-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/purchase-orders-service/dist ./dist
COPY --from=build /app/services/purchase-orders-service/node_modules ./node_modules
COPY --from=build /app/services/purchase-orders-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/suppliers-service/package*.json ./services/suppliers-service/
COPY services/suppliers-service/tsconfig*.json ./services/suppliers-service/
COPY services/suppliers-service/nest-cli.json ./services/suppliers-service/
COPY services/suppliers-service/src ./services/suppliers-service/src

WORKDIR /app/services/suppliers-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/suppliers-service/dist ./dist
COPY --from=build /app/services/suppliers-service/node_modules ./node_modules
COPY --from=build /app/services/suppliers-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

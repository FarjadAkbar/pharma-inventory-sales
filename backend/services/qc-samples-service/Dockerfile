FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/qc-samples-service/package*.json ./services/qc-samples-service/
COPY services/qc-samples-service/tsconfig*.json ./services/qc-samples-service/
COPY services/qc-samples-service/nest-cli.json ./services/qc-samples-service/
COPY services/qc-samples-service/src ./services/qc-samples-service/src

WORKDIR /app/services/qc-samples-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/qc-samples-service/dist ./dist
COPY --from=build /app/services/qc-samples-service/node_modules ./node_modules
COPY --from=build /app/services/qc-samples-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

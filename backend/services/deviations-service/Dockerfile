FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/deviations-service/package*.json ./services/deviations-service/
COPY services/deviations-service/tsconfig*.json ./services/deviations-service/
COPY services/deviations-service/nest-cli.json ./services/deviations-service/
COPY services/deviations-service/src ./services/deviations-service/src

WORKDIR /app/services/deviations-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/deviations-service/dist ./dist
COPY --from=build /app/services/deviations-service/node_modules ./node_modules
COPY --from=build /app/services/deviations-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

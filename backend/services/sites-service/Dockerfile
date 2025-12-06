FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/sites-service/package*.json ./services/sites-service/
COPY services/sites-service/tsconfig*.json ./services/sites-service/
COPY services/sites-service/nest-cli.json ./services/sites-service/
COPY services/sites-service/src ./services/sites-service/src

WORKDIR /app/services/sites-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/sites-service/dist ./dist
COPY --from=build /app/services/sites-service/node_modules ./node_modules
COPY --from=build /app/services/sites-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

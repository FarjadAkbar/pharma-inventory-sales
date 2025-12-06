FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/auth-service/tsconfig*.json ./services/auth-service/
COPY services/auth-service/nest-cli.json ./services/auth-service/
COPY services/auth-service/src ./services/auth-service/src

WORKDIR /app/services/auth-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/auth-service/dist ./dist
COPY --from=build /app/services/auth-service/node_modules ./node_modules
COPY --from=build /app/services/auth-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

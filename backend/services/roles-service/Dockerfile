FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared code
COPY shared ./shared
COPY src ./src

# Copy service-specific files
COPY services/roles-service/package*.json ./services/roles-service/
COPY services/roles-service/tsconfig*.json ./services/roles-service/
COPY services/roles-service/nest-cli.json ./services/roles-service/
COPY services/roles-service/src ./services/roles-service/src

WORKDIR /app/services/roles-service

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Build service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/services/roles-service/dist ./dist
COPY --from=build /app/services/roles-service/node_modules ./node_modules
COPY --from=build /app/services/roles-service/package*.json ./
COPY --from=build /app/shared ../shared
COPY --from=build /app/src ../src

CMD ["node", "dist/main.js"]

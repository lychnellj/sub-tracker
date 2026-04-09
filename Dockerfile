FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/dist ./public

FROM node:20-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --omit=dev
COPY --from=backend-builder /app/backend/src ./src
COPY --from=backend-builder /app/backend/public ./public
EXPOSE 8080
CMD ["node", "src/index.js"]

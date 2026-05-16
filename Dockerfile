FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "backend/server.js"]

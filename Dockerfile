FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY src/ ./src/

# Каталог для SQLite-файла: создаём и передаём во владение non-root
# пользователю заранее, иначе при первом монтировании volume Docker создаст
# точку монтирования от root и node:sqlite не сможет открыть файл на запись.
RUN mkdir -p backend/data && chown -R node:node backend/data

ENV PORT=3000
EXPOSE 3000

USER node

CMD ["node", "backend/server.js"]

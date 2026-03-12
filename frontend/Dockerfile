FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "npm install --legacy-peer-deps && npm run dev -- --host"]
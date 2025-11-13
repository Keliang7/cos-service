FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/app.js"]
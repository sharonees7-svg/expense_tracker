FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Ensure data directory exists inside the container
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "server.js"]

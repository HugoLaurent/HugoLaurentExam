FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install react-scripts@5.0.1 -g

RUN npm audit fix --force

COPY . .



RUN npm run build

FROM node:18-alpine as runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]

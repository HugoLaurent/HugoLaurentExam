FROM node:18-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install --production

# Copier le reste du code
COPY . .

EXPOSE 5000

# Démarrer l'API
CMD ["node", "server.js"]

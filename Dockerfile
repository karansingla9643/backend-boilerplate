# Dockerfile
FROM node:18-alpine

# 1) set your workdir
WORKDIR /usr/src/node-app

# 2) copy just the package manifests & install as root
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# 3) copy the rest of your code
COPY . .

# 4) fix permissions so the `node` user can write everywhere
RUN chown -R node:node /usr/src/node-app

# 5) drop to the unprivileged node user
USER node

# 6) expose your dev port
EXPOSE 3000

# 7) run your dev script
CMD ["sh", "-c", "npm run migrate && npm run dev"]

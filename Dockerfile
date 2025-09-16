# Match the Playwright version you use in package.json
FROM mcr.microsoft.com/playwright:v1.55.0-jammy

WORKDIR /app

COPY package*.json ./
# Use ci for clean install; make sure playwright is in "dependencies" (not devDependencies)
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
# Railway sets PORT; your server must read it
CMD ["node", "server.js"]

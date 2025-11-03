# Match the Playwright version you use in package.json
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

COPY package*.json ./
# Install dependencies (prod only)
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production

# Railway sets PORT; your server must read it via process.env.PORT
CMD ["node", "server.js"]

FROM node:24-alpine

WORKDIR /app

# Install some system dependencies
RUN apk add --no-cache tini

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY src/ ./src/

EXPOSE 3000
CMD [ "tini", "--", "npm", "run", "start" ]

# Build stage: install dependencies
FROM dhi.io/node:26-alpine-dev AS build
WORKDIR /app

# Install dependencies and copy source code
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ ./src/

# Runtime stage
FROM dhi.io/node:26-alpine AS runtime
EXPOSE 3000
CMD [ "node", "src/index.ts" ]
COPY --from=build /app/ /app/

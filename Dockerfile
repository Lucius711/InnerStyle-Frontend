# ----- Build stage: build the Vite SPA -----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Same-origin API (nginx proxies /api to the backend), so the base URL is empty.
ARG VITE_API_BASE_URL=""
# Public social-login client IDs are embedded at build time (leave empty to hide the buttons).
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_FACEBOOK_APP_ID=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_FACEBOOK_APP_ID=$VITE_FACEBOOK_APP_ID
RUN npm run build

# ----- Runtime stage: serve static assets + reverse-proxy the API via nginx -----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

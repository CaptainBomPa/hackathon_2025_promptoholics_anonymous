# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_BASE_URL=http://localhost:8080
ARG REACT_APP_ENV=production
ARG REACT_APP_USE_MOCK_DATA=false

# Set environment variables
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_ENV=$REACT_APP_ENV
ENV REACT_APP_USE_MOCK_DATA=$REACT_APP_USE_MOCK_DATA

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
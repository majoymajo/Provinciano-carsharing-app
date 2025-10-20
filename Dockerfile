# Use Node.js LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server ./server
COPY public ./public
COPY database ./database

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server/index.js"]

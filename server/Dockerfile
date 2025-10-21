FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Expose port
EXPOSE 5001

# Start the development server
CMD ["npm", "run", "dev"]


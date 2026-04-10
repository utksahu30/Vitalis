FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build and tsx)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite frontend application
RUN npm run build

# Expose the port your Express server runs on
EXPOSE 3000

# Set environment variable to production
ENV NODE_ENV=production

# Start the application using tsx
CMD ["npx", "tsx", "server.ts"]

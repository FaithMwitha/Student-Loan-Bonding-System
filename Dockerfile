
# 1. Use Node.js as the base image
FROM node:22-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Use the same npm version as the local environment
RUN npm install -g npm@11.6.2

# 4. Copy package files
COPY package*.json ./

# 5. Install dependencies
RUN npm ci

# 6. Copy the entire project
COPY . .

# 7. Build the NestJS application
RUN npm run build

# 8. Expose the application port
EXPOSE 3000

# 9. Start the application
CMD ["npm", "run", "start:prod"]

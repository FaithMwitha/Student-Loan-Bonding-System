
# 1. Use Node.js as the base image
FROM node:22-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm ci

# 5. Copy the entire project
COPY . .

# 6. Build the NestJS application
RUN npm run build

# 7. Expose the application port
EXPOSE 3000

# 8. Start the application
CMD ["npm", "run", "start:prod"]

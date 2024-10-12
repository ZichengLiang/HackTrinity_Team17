# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Use NGINX to serve the built app
FROM nginx:alpine

# Copy the build output to NGINX’s HTML directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose the NGINX port
EXPOSE 80

# Command to run NGINX
CMD ["nginx", "-g", "daemon off;"]

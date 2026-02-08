# Use the official nginx image as a parent image
FROM nginx:stable-alpine
# Copy the local files to the Nginx web server directory
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/
# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
# Nginx default is 80, but can be configured to use the PORT variable
# For a simple static site this is often fine, but if you need to respect the PORT env var for dynamic serving, you need a custom nginx.conf
# For this example, we rely on the default nginx behavior
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
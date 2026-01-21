FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application files
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# For development, use dev server
CMD ["npm", "run", "dev"]

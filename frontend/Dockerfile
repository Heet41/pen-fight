FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/

RUN npm install --workspace=frontend

COPY frontend/ ./frontend/

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host"]

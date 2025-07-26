<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Vite React TypeScript \& Docker Tutorial

## Step 1: Project Setup (Basic Vite React-TS App)

### Commands

```bash
# 1. Create the project
 create vite@latest todo-app -- --template react-ts

# 2. Enter directory
cd todo-app

# 3. Install dependencies
yarn install
```


### Generated Structure

```
todo-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```


## Step 2: Understand Default Project Structure

- **index.html** (root): loads `/src/main.tsx`
- **src/main.tsx**: mounts `<App />`
- **src/App.tsx**: sample counter component
- **vite.config.ts**:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

- **package.json** scripts:

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

- **Hot Reload**: `yarn dev` → http://localhost:5173


## Step 3: Dockerize the Application

### 3.1 Update `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: { usePolling: true }
  },
  preview: {
    host: true,
    port: 5173
  }
})
```


### 3.2 `Dockerfile.dev` (Development)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 5173
CMD ["yarn", "dev"]
```


### 3.3 `Dockerfile` (Production)

```dockerfile
# builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```


### 3.4 `nginx.conf`

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  location /health { return 200 "healthy\n"; }
}
```


### 3.5 `docker-compose.yml`

```yaml
services:
  vite-dev:
    build: { context: ., dockerfile: Dockerfile.dev }
    ports: ["5173:5173"]
    volumes: [.:/app, /app/node_modules]
    environment: [NODE_ENV=development, CHOKIDAR_USEPOLLING=true]
    profiles: [development]

  vite-prod:
    build: { context: ., dockerfile: Dockerfile }
    ports: ["3000:80"]
    environment: [NODE_ENV=production]
    profiles: [production]
```


### 3.6 `.dockerignore`

```
node_modules
dist
.git
*.log
.env*
.DS_Store
```


## Step 4: Test Containers

- **Dev Container**

```bash
docker compose --profile development up --build
# → http://localhost:5173
```

- **Prod Container**

```bash
docker compose --profile production up --build
# → http://localhost:3000
```


## Step 5: Troubleshooting

1. **Use** `docker compose` (not `docker-compose`).
2. **Remove** obsolete `version:` in `docker-compose.yml`.
3. **Fix permissions**:

```bash
sudo chown -R $(whoami) ~/.docker/
```


## Step 6: Next Steps (Playwright \& CI)

1. Create `playwright.config.ts`
2. Add tests under `tests/e2e/`
3. Containerize Playwright (`Dockerfile.playwright`)
4. Create GitHub Actions workflow

---

Save this file as **TUTORIAL.md** for quick reference.


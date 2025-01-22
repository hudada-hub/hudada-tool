# Docker 开发流程指南

## 一、开发环境准备

### 1. 安装 Docker
```bash
# Windows/Mac
# 下载并安装 Docker Desktop

# Linux
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 配置镜像加速
```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.cn-hangzhou.aliyuncs.com"
  ]
}
```

## 二、项目初始化

### 1. 创建项目结构
```bash
my-project/
├── src/                # 源代码
├── Dockerfile         # Docker 构建文件
├── .dockerignore     # Docker 忽略文件
├── docker-compose.yml # 多容器配置
└── README.md         # 项目说明
```

### 2. 编写 Dockerfile
```dockerfile
# 开发环境
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
```

### 3. 配置 .dockerignore
```plaintext
node_modules
.git
.env
*.log
dist
```

## 三、本地开发流程

### 1. 启动开发环境
```bash
# 使用 docker-compose 启动开发环境
docker-compose up -d

# ���看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2. 代码修改和热重载
```yaml
# docker-compose.yml 开发配置
version: '3'
services:
  app:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

### 3. 调试技巧
```bash
# 进入容器
docker exec -it container_name sh

# 查看日志
docker logs -f container_name

# 检查容器状态
docker stats container_name
```

## 四、测试流程

### 1. 单元测试
```dockerfile
# 测试环境 Dockerfile
FROM node:18-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "test"]
```

### 2. 集成测试
```yaml
# docker-compose.test.yml
version: '3'
services:
  app:
    build: 
      context: .
      target: test
    depends_on:
      - db
  
  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
```

## 五、构建和发布

### 1. 构建生产镜像
```bash
# 构建镜像
docker build -t myapp:prod .

# 测试镜像
docker run --rm myapp:prod npm test
```

### 2. 推送到镜像仓库
```bash
# 登录镜像仓库
docker login

# 标记镜像
docker tag myapp:prod username/myapp:prod

# 推送镜像
docker push username/myapp:prod
```

## 六、常见开发场景

### 1. 前端开发
```yaml
# docker-compose.yml
version: '3'
services:
  frontend:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    command: npm run dev
```

### 2. 后端开发
```yaml
version: '3'
services:
  backend:
    build: .
    volumes:
      - .:/app
    ports:
      - "8080:8080"
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=dev
      - POSTGRES_USER=dev
      - POSTGRES_PASSWORD=dev
```

### 3. 全栈开发
```yaml
version: '3'
services:
  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
    ports:
      - "8080:8080"
  
  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=dev
      - MYSQL_DATABASE=dev
```

## 七、开发技巧

### 1. 使用多阶段构建
```dockerfile
# 开发阶段
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 2. 开发环境优化
```bash
# 使用 volume 缓存依赖
docker volume create node_modules

# 使用缓存卷
docker run -v node_modules:/app/node_modules ...
```

### 3. 调试配置
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Node",
      "remoteRoot": "/app"
    }
  ]
}
```

## 八、最佳实践

### 1. 开发规范
- 使用 .dockerignore 排除不必要的文件
- 合理使用多阶段构建
- 保持开发环境的一致性

### 2. 性能优化
- 使用适当的基础镜像
- 优化构建缓存
- 合理配置卷挂载

### 3. 团队协作
- 统一开发环境配置
- 使用版本控制管理 Docker 配置
- 建立规范的开发流程
</rewritten_file> 
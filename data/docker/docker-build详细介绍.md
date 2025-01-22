# Docker Build 详细指南

## 基础语法

### 1. 基本命令格式
```bash
# 基本构建命令
pnpm docker build -t <镜像名称>:<标签> <构建上下文路径>

# 使用指定Dockerfile构建
pnpm docker build -f /path/to/Dockerfile -t <镜像名称>:<标签> .
```

## Dockerfile 核心指令

### 1. 基础镜像设置
```dockerfile
# 使用官方Node.js镜像作为基础
FROM node:18-alpine

# 多阶段构建示例
FROM node:18-alpine AS builder
```

### 2. 工作目录和环境变量
```dockerfile
# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
```

### 3. 文件操作
```dockerfile
# 复制package.json
COPY package.json pnpm-lock.yaml ./

# 复制源代码
COPY . .

# 添加压缩文件
ADD app.tar.gz /app/
```

### 4. 运行命令
```dockerfile
# 安装依赖
RUN pnpm install

# 多行命令示例
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

## 高级构建特性

### 1. 多阶段构建
```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build

# 生产阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
RUN pnpm install --prod
CMD ["pnpm", "start"]
```

### 2. 构建参数
```dockerfile
# 定义构建参数
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ARG PORT=3000
ENV PORT=${PORT}
```

### 3. 构建缓存优化
```dockerfile
# 优化依赖安装缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
```

## 构建上下文和忽略文件

### 1. .dockerignore 文件
```plaintext
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
```

### 2. 构建上下文示例
```bash
# 从当前目录构建
pnpm docker build .

# 从指定目录构建
pnpm docker build /path/to/source
```

## 常用构建选项

### 1. 网络和代理设置
```bash
# 使用主机网络构建
pnpm docker build --network=host .

# 设置构建代理
pnpm docker build --build-arg HTTP_PROXY=http://proxy:8080 .
```

### 2. 缓存控制
```bash
# 禁用缓存构建
pnpm docker build --no-cache .

# 从特定阶段开始构建
pnpm docker build --target builder .
```

## 构建模式和优化

### 1. 开发环境构建
```dockerfile
# 开发环境Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN pnpm install
COPY . .
CMD ["pnpm", "dev"]
```

### 2. 生产环境构建
```dockerfile
# 生产环境多阶段构建
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["pnpm", "start"]
```

## 最佳实践

1. **层优化**
   - 合并相关命令减少层数
   - 合理使用多阶段构建
   - 优化缓存利用

2. **安全考虑**
   - 使用特定版本基础镜像
   - 及时更新安全补丁
   - 最小化安装包

3. **性能优化**
   - 合理使用构建缓存
   - 优化构建上下文大小
   - 使用适当的基础镜像

## 常见问题解决

### 1. 构建失败处理
```bash
# 清理所有构建缓存
pnpm docker builder prune

# 查看构建历史
pnpm docker history <镜像名称>
```

### 2. 调试构建过程
```bash
# 启用构建详细输出
pnpm docker build --progress=plain .

# 查看中间容器
pnpm docker build --progress=plain . 2>&1 | grep "Running in"
```

## 总结

Docker build 是容器化应用程序的核心步骤，掌握其各种特性和最佳实践对于构建高效、安全的容器镜像至关重要。通过合理使用多阶段构建、构建缓存和优化策略，可以显著提升构建效率和最终镜像质量。 
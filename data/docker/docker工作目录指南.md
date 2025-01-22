# Docker 工作目录指南

## 一、Docker 工作目录概述

Docker 工作目录（Working Directory）是容器内部的当前工作目录，通过 `WORKDIR` 指令设置。它影响容器内部命令的执行路径和文件操作的相对路径。

### 1. 主要作用
- 设置容器内部的当前工作目录
- 影响后续指令的执行路径
- 提供更好的文件组织结构
- 增强安全性和可维护性

## 二、WORKDIR 指令使用

### 1. 基本语法
```dockerfile
# Dockerfile 中设置工作目录
WORKDIR /path/to/workdir

# 示例
WORKDIR /app
WORKDIR /usr/src/app
```

### 2. 特性说明
- 可以使用绝对路径或相对路径
- 如果目录不存在会自动创建
- 可以使用环境变量
- 支持多次设置，路径会叠加

### 3. 使用示例
```dockerfile
# 基本用法
FROM node:14
WORKDIR /app
COPY . .
RUN npm install

# 使用环境变量
FROM ubuntu
ENV APP_HOME=/usr/src/app
WORKDIR $APP_HOME

# 相对路径
WORKDIR /app
WORKDIR src
WORKDIR app
# 最终路径为 /app/src/app
```

## 三、常见使用场景

### 1. Node.js 应用
```dockerfile
FROM node:14-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 启动应用
CMD ["npm", "start"]
```

### 2. Python 应用
```dockerfile
FROM python:3.8-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 启动应用
CMD ["python", "app.py"]
```

### 3. Web 服务器
```dockerfile
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制静态文件
COPY ./dist .

# 复制配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## 四、最佳实践

### 1. 目录结构规范
```plaintext
/app                # 应用根目录
├── src/           # 源代码
├── config/        # 配置文件
├── logs/          # 日志文件
└── data/          # 数据文件
```

### 2. 安全性考虑
```dockerfile
# 创建专用用户
RUN adduser --disabled-password --gecos "" appuser

# 设置工作目录
WORKDIR /app

# 设置目录权限
RUN chown -R appuser:appuser /app

# 切换用户
USER appuser
```

### 3. 多阶段构建
```dockerfile
# 构建阶段
FROM node:14 AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /build/dist .
```

## 五、常见问题解决

### 1. 权限问题
```dockerfile
# 设置目录权限
WORKDIR /app
RUN chown -R node:node /app
USER node
```

### 2. 路径问题
```dockerfile
# 使用绝对路径
WORKDIR /app
COPY . .

# 避免使用相对路径
WORKDIR /app
COPY ./src ./src  # 明确指定源和目标
```

### 3. 环境变量
```dockerfile
# 使用 ARG 和 ENV
ARG APP_HOME=/app
ENV APP_HOME=${APP_HOME}
WORKDIR ${APP_HOME}
```

## 六、调试技巧

### 1. 检查工作目录
```bash
# 查看容器工作目录
docker inspect -f '{{.Config.WorkingDir}}' container_name

# 进入容器并检查
docker exec -it container_name pwd
```

### 2. 验证文件位置
```bash
# 列出工作目录内容
docker exec -it container_name ls -la

# 检查文件权限
docker exec -it container_name ls -l /app
```

### 3. 临时修改工作目录
```bash
# 在运行时指定工作目录
docker run -w /custom/path image_name command

# 在 exec 时指定工作目录
docker exec -w /custom/path container_name command
```

## 七、注意事项

1. **路径设置**
   - 使用绝对路径而不是相对路径
   - 确保路径存在或能被创建
   - 注意路径权限问���

2. **用户权限**
   - 合理设置目录所有者
   - 避免使用 root 用户
   - 正确设置文件权限

3. **性能考虑**
   - 避免频繁切换工作目录
   - 合理组织文件结构
   - 注意文件系统性能影响 
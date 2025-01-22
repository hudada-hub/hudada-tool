# Dockerfile 学习指南

## 一、什么是 Dockerfile
Dockerfile 是一个用来构建镜像的文本文件，文件中包含了一条条构建镜像所需的指令和说明。通过 Dockerfile，我们可以定制自己的镜像，实现自动化构建。

## 二、Dockerfile 基本结构
```dockerfile
# 注释
指令 参数
```
- 指令不区分大小写，建议使用大写，便于与参数区分
- 指令从上到下顺序执行
- 每条指令都会创建一个新的镜像层

## 三、基本指令详解

### 1. FROM - 指定基础镜像
```dockerfile
FROM <镜像名>[:<标签>]

# 示例
FROM ubuntu:20.04
FROM python:3.8-slim
```
- 必须是第一条非注释指令
- 可以在一个 Dockerfile 中多次出现，用于构建多阶段镜像

### 2. MAINTAINER - 维护者信息（已弃用）
```dockerfile
MAINTAINER <name>

# 推荐使用 LABEL 代替
LABEL maintainer="your-email@example.com"
```

### 3. WORKDIR - 设置工作目录
```dockerfile
WORKDIR <工作目录路径>

# 示例
WORKDIR /app
WORKDIR /usr/src/app
```
- 用于设置后续指令的工作目录
- 如果目录不存在会自动创建
- ��以使用多个 WORKDIR 指令，路径可以是相对路径

### 4. COPY 和 ADD - 复制文件
```dockerfile
COPY <源路径> <目标路径>
ADD <源路径> <目标路径>

# 示例
COPY . /app
COPY package*.json ./
ADD https://example.com/file.tar.gz /app/
```
- COPY：单纯复制文件和目录
- ADD：比 COPY 更高级，可以：
  - 解压压缩文件
  - 从 URL 下载文件
- 推荐使用 COPY，功能更加清晰

### 5. RUN - 执行命令
```dockerfile
# shell 格式
RUN <命令>

# exec 格式
RUN ["可执行文件", "参数1", "参数2"]

# 示例
RUN apt-get update && apt-get install -y nodejs
RUN ["pip", "install", "flask"]
```
- 在镜像构建过程中执行命令
- 每个 RUN 指令都会创建一个新层
- 建议将多个命令合并成一个 RUN 指令，减少镜像层数

### 6. ENV - 设置环境变量
```dockerfile
ENV <key>=<value> ...

# 示例
ENV NODE_VERSION=14.17.0
ENV PATH=$PATH:/usr/local/bin
```
- 设置环境变量，可以被后续指令使用
- 可以一次设置多个环境变量

### 7. EXPOSE - 声明端口
```dockerfile
EXPOSE <端口> [<端口>...]

# 示例
EXPOSE 80
EXPOSE 80 443
```
- 声明容器运行时监听的端口
- 仅仅是声明，并不会自动开放端口

### 8. CMD 和 ENTRYPOINT - 容器启动命令
```dockerfile
# CMD 的��种格式
CMD ["可执行文件", "参数1", "参数2"]  # exec 格式（推荐）
CMD ["参数1", "参数2"]                # 作为 ENTRYPOINT 的默认参数
CMD 命令 参数1 参数2                  # shell 格式

# ENTRYPOINT 的两种格式
ENTRYPOINT ["可执行文件", "参数1"]    # exec 格式（推荐）
ENTRYPOINT 命令 参数1                 # shell 格式

# 示例
CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["python", "app.py"]
```
- CMD：
  - 指定容器启动时要运行的命令
  - 可以被 docker run 命令行参数覆盖
  - 一个 Dockerfile 只能有一个 CMD 生效
- ENTRYPOINT：
  - 指定容器启动时要运行的命令
  - 不会被 docker run 命令行参数覆盖
  - 命令行参数会被当作参数传递给 ENTRYPOINT

## 四、最佳实践

### 1. 多阶段构建
```dockerfile
# 构建阶段
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```
- 用于减小最终镜像的大小
- 只将必要的文件复制到最终镜像中

### 2. 优化层数和大小
```dockerfile
# 不推荐
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2

# 推荐
RUN apt-get update && \
    apt-get install -y \
        package1 \
        package2 \
    && rm -rf /var/lib/apt/lists/*
```
- 合并多个 RUN 指令
- 清理不必要的文件
- 使用 .dockerignore 排除不需要的文件

### 3. 使用 .dockerignore
```plaintext
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
```
- 排除不需要的文件和目录
- 提高构建速度
- 减少构建上下文大小

## 五、实际示例

### 1. Node.js 应用
```dockerfile
# 使用官方 Node.js 镜像作为基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 2. Python Web 应用
```dockerfile
# 使用官方 Python 镜像
FROM python:3.8-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["python", "app.py"]
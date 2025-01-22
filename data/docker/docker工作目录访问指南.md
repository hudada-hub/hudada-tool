# Docker工作目录(WORKDIR)访问指南

## 访问工作目录的几种方式

### 1. 容器运行时访问

1. **使用docker exec进入容器**
```bash
# 进入容器的交互式终端
docker exec -it <容器ID或名称> sh
# 或者
docker exec -it <容器ID或名称> bash

# 查看当前工作目录
pwd

# 列出工作目录内容
ls -la
```

2. **直接在容器中执行命令**
```bash
# 查看工作目录路径
docker exec <容器ID或名称> pwd

# 列出工作目录内容
docker exec <容器ID或名称> ls -la
```

### 2. 挂载访问

1. **将工作目录挂载到主机**
```bash
# 运行容器时挂载工作目录
docker run -v $(pwd):/app -w /app <镜像名称>

# 或者使用具名卷
docker run -v myapp:/app -w /app <镜像名称>
```

2. **在docker-compose中挂载**
```yaml
version: '3'
services:
  app:
    image: node:alpine
    working_dir: /app
    volumes:
      - .:/app
```

### 3. 复制文件方式访问

1. **从容器复制到主机**
```bash
# 复制容器工作目录中的文件到主机
docker cp <容器ID>:/app/file.txt ./host-file.txt
```

2. **从主机复制到容器**
```bash
# 复制主机文件到容器的工作目录
docker cp ./host-file.txt <容器ID>:/app/file.txt
```

## 常见使用场景

### 1. 开发环境

```bash
# 启动开发容器并挂载当前目录
docker run -it -v $(pwd):/app -w /app node:alpine sh

# 在容器中运行开发命令
npm install
npm start
```

### 2. 调试文件

```bash
# 进入容器检查文件
docker exec -it <容器ID> sh
cd /app
cat config.json

# 或直接查看文件
docker exec <容器ID> cat /app/config.json
```

### 3. 日志查看

```bash
# 查看工作目录下的日志文件
docker exec <容器ID> tail -f /app/logs/app.log
```

## 权限相关注意事项

1. **检查目录权限**
```bash
# 查看工作目录权限
docker exec <容器ID> ls -la /app

# 修改权限（如果需要）
docker exec <容器ID> chown -R node:node /app
```

2. **挂载时的权限处理**
```bash
# 使用用户映射运行容器
docker run -u $(id -u):$(id -g) -v $(pwd):/app -w /app <镜像名称>
```

## 最佳实践

1. **使用相对路径**
```bash
# 在工作目录中使用相对路径
docker exec <容器ID> ./script.sh
```

2. **环境变量结合**
```bash
# 使用环境变量设置工作目录
docker run -e APP_DIR=/app -w $APP_DIR <镜像名称>
```

3. **多容器共享**
```yaml
version: '3'
services:
  app:
    working_dir: /app
    volumes:
      - app_data:/app
  worker:
    working_dir: /app
    volumes:
      - app_data:/app

volumes:
  app_data:
```

## 常见问题解决

1. **权限不足**
```bash
# 临时解决方案
docker exec -u root <容器ID> chown -R user:user /app

# 永久解决方案（在Dockerfile中）
RUN mkdir -p /app && chown -R user:user /app
WORKDIR /app
USER user
```

2. **路径不存在**
```bash
# 确保目录存在
docker exec <容器ID> mkdir -p /app

# 或在运行时创建
docker run --rm <镜像名称> mkdir -p /app
```

## 调试技巧

1. **查看工作目录信息**
```bash
# 查看完整路径
docker exec <容器ID> pwd

# 查看目录结构
docker exec <容器ID> tree /app
```

2. **监控文件变化**
```bash
# 实时监控工作目录变化
docker exec <容器ID> watch -n 1 "ls -la /app"
```

## 总结

访问Docker工作目录的方法多样，主要包括：
- 通过docker exec直接访问
- 通过卷挂载访问
- 通过docker cp复制文件
- 通过docker-compose配置访问

选择合适的访问方式取决于具体的使用场景和需求。在实际使用中，需要注意权限管理和安全性考虑。 
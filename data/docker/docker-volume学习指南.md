# Docker Volume 学习指南

## 一、Docker Volume 简介

Docker Volume（数据卷）是 Docker 持久化数据的最佳方式，它可以将容器内的数据存储在主机上，实现数据持久化和容器间的数据共享。

### 1. 主要特点
- 数据持久化
- 容器间共享数据
- 数据备份和恢复
- 与容器生命周期解耦
- 支持多种存储驱动

## 二、Volume 类型

### 1. 命名卷（Named Volumes）
```bash
# 创建命名卷
docker volume create my-volume

# 使用命名卷
docker run -v my-volume:/app/data nginx
```

### 2. 匿名卷（Anonymous Volumes）
```bash
# 创建匿名卷
docker run -v /app/data nginx
```

### 3. 绑定挂载（Bind Mounts）
```bash
# 挂载主机目录
docker run -v /host/path:/container/path nginx
```

## 三、Volume 管理命令

### 1. 基本操作
```bash
# 创建数据卷
docker volume create my-volume

# 查看所有数据卷
docker volume ls

# 查看数据卷详细信息
docker volume inspect my-volume

# 删除数据卷
docker volume rm my-volume

# 删除所有未使用的数据卷
docker volume prune
```

### 2. 在容器中使用数据卷
```bash
# 使用 -v 参数
docker run -v my-volume:/app/data nginx

# 使用 --mount 参数（更明确的语法）
docker run --mount source=my-volume,target=/app/data nginx
```

## 四、常见使用场景

### 1. 数据库数据持久化
```bash
# MySQL 数据持久化
docker run -d \
  --name mysql-db \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:5.7

# PostgreSQL 数据持久化
docker run -d \
  --name postgres-db \
  -v postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:13
```

### 2. Web 应用配置文件
```bash
# Nginx 配置文件挂载
docker run -d \
  --name nginx-web \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  -v ./html:/usr/share/nginx/html \
  nginx:alpine
```

### 3. 开发环境
```bash
# Node.js 应用开发
docker run -d \
  --name node-app \
  -v $(pwd):/app \
  -v node_modules:/app/node_modules \
  node:14 npm run dev
```

## 五、在 Docker Compose 中使用 Volume

### 1. 基本配置
```yaml
version: "3.8"
services:
  web:
    image: nginx
    volumes:
      - web-data:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf:ro

  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql

volumes:
  web-data:
  db-data:
```

### 2. 高级��置
```yaml
version: "3.8"
services:
  web:
    image: nginx
    volumes:
      - type: volume
        source: web-data
        target: /usr/share/nginx/html
        volume:
          nocopy: true
      - type: bind
        source: ./nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true

volumes:
  web-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=10.0.0.1,rw
      device: ":/path/to/dir"
```

## 六、数据卷备份和恢复

### 1. 备份数据卷
```bash
# 创建备份容器
docker run --rm \
  -v my-volume:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/my-volume-backup.tar.gz -C /source .
```

### 2. 恢复数据卷
```bash
# 从备份恢复
docker run --rm \
  -v my-volume:/target \
  -v $(pwd):/backup \
  alpine sh -c "cd /target && tar xzf /backup/my-volume-backup.tar.gz"
```

## 七、最佳实践

### 1. 数据持久化策略
- 使用命名卷而不是匿名卷
- 为重要数据配置备份策略
- 使用合适的存储驱动

### 2. 权限管理
```bash
# 设置卷权限
docker run -v my-volume:/app/data:ro nginx  # 只读挂载
docker run -v my-volume:/app/data:rw nginx  # 读写挂载

# 设置用户权限
docker run -v my-volume:/app/data --user 1000:1000 nginx
```

### 3. 性能优化
- 使用适合的存储驱��
- 避免大量小文件
- 合理使用缓存卷

## 八、常见问题解决

### 1. 权限问题
```bash
# 修改卷权限
docker run --rm \
  -v my-volume:/data \
  alpine chown -R user:group /data
```

### 2. 数据清理
```bash
# 安全删除数据
docker volume rm my-volume

# 批量清理
docker volume prune --filter "label!=keep"
```

### 3. 性能问题
```yaml
# 使用 tmpfs 挂载提高性能
docker run --tmpfs /app/cache nginx

# 在 Compose 中配置 tmpfs
services:
  web:
    image: nginx
    tmpfs:
      - /app/cache
      - /tmp
```

## 九、调试技巧

### 1. 检查挂载点
```bash
# 查看容器挂载信息
docker inspect -f '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}' container_name
```

### 2. 验证数据持久化
```bash
# 测试数据持久化
docker run --rm -v my-volume:/data alpine sh -c "echo 'test' > /data/test.txt"
docker run --rm -v my-volume:/data alpine cat /data/test.txt
```

### 3. 监控卷使用情况
```bash
# 查看卷使用情况
docker system df -v

# 查看详细信息
docker volume inspect my-volume
``` 
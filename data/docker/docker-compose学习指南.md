# Docker Compose 学习指南

## 一、Docker Compose 简介

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YAML 文件来配置应用程序的服务。

### 1. 主要功能
- 在单个文件中定义多容器应用
- 保持容器创建和启动的可重复性
- 管理容器的完整生命周期
- 支持开发、测试和生产环境

## 二、基本概念

### 1. 核心概念
- **服务 (services)**：容器的定义，包括使用的镜像、端口映射等
- **网络 (networks)**：容器间的通信网络
- **数据卷 (volumes)**：持久化数据的存储位置

### 2. 文件结构
```yaml
version: "3.8"  # compose 文件版本
services:       # 服务定义
  web:          # 服务名称
    image: nginx  # 使用的镜像
  db:           # 另一个服务
    image: mysql
volumes:        # 数据卷定义
networks:       # 网络定义
```

## 三、docker-compose.yml 配置详解

### 1. 基本配置示例
```yaml
version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NGINX_HOST=example.com
    networks:
      - frontend
    depends_on:
      - api

  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    networks:
      - frontend
      - backend
    depends_on:
      - db

  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=myapp
    networks:
      - backend

volumes:
  db-data:

networks:
  frontend:
  backend:
```

### 2. 常用配置项说明

#### build 配置
```yaml
services:
  web:
    build:
      context: ./dir    # 构建上下文路径
      dockerfile: Dockerfile.dev    # Dockerfile 文件名
      args:    # 构建参数
        buildno: 1
```

#### 端口映射
```yaml
services:
  web:
    ports:
      - "80:80"    # 主机端口:容器端口
      - "443:443"
    expose:
      - "3000"     # 仅暴露给其他容器
```

#### 数据卷配置
```yaml
services:
  db:
    volumes:
      - db-data:/var/lib/mysql    # 命名卷
      - ./backup:/backup    # 绑定挂载
      - /tmp/data:/tmp/data:ro    # 只读挂载
```

#### 环境变量
```yaml
services:
  web:
    environment:    # 直接定义
      - NODE_ENV=production
    env_file:    # 使用���境变量文件
      - .env
```

#### 依赖关系
```yaml
services:
  web:
    depends_on:    # 定义启动顺序
      - db
      - redis
```

## 四、常用命令

### 1. 基本操作
```bash
# 启动所有服务
docker-compose up

# 后台启动
docker-compose up -d

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 进入服务容器
docker-compose exec service_name sh
```

### 2. 构建相关
```bash
# 构建服务
docker-compose build

# 构建并启动
docker-compose up --build

# 拉取镜像
docker-compose pull
```

### 3. 服务管理
```bash
# 启动特定服务
docker-compose up service_name

# 停止特定服务
docker-compose stop service_name

# 重启服务
docker-compose restart service_name

# 查看服务日志
docker-compose logs -f service_name
```

## 五、实际应用示例

### 1. Web 应用开发环境
```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    environment:
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### 2. 生产环境配置
```yaml
version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

  app:
    image: myapp:latest
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=myapp
    command: --default-authentication-plugin=mysql_native_password

volumes:
  db-data:
```

## 六、最佳实践

1. **环境变量管理**
   - 使用 `.env` 文件存储敏感信息
   - 不同环境使用不同的 compose 文件

2. **数据持久化**
   - 使用命名卷而不是绑定挂载
   - 定期备份数据卷

3. **网络安全**
   - 合理规划网络隔离
   - 只暴露必要的端口

4. **服务扩展**
   - 使用 `deploy` 配置管理扩展
   - 合理设置资源限制

5. **日志管理**
   - 配置日志驱动
   - 实现日志轮转

## 七、常见问题解决

### 1. 容器启动顺序
```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 2. 网络问题
```yaml
services:
  web:
    networks:
      backend:
        ipv4_address: 172.16.238.10
networks:
  backend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.16.238.0/24
```

### 3. 资源限制
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
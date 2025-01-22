# Docker 容器自启动配置指南

## 一、设置容器自启动的方法

### 1. 创建容器时设置自启动
```bash
# 基本语法
docker run -d --restart=always --name 容器名称 镜像名称

# 示例：创建一个自启动的 Nginx 容器
docker run -d --restart=always --name web-server -p 80:80 nginx
```

### 2. 为已存在的容器设置自启动
```bash
# 基本语法
docker update --restart=always 容器名称或容器ID

# 示例：将现有的 MySQL 容器设置为自启动
docker update --restart=always mysql-db
```

## 二、restart 策略说明

Docker 提供了四种重启策略：

1. **no**
   - 默认策略
   - 容器退出时不重启
   - 适用于临时性的容器

2. **on-failure[:max-retries]**
   - 容器非正常退出时重启（退出状态非0）
   - 可以指定最大重试次数
   - 示例：`--restart=on-failure:3`
   - 适用于任务型容器

3. **always**
   - 容器退出时总是重启
   - Docker 守护进程启动时，也会启动相关容器
   - 适用于需要持续运行的服务

4. **unless-stopped**
   - 容器退出时总是重启
   - 不考虑在 Docker 守护进程启动时就已经停止了的容器
   - 适用于需要手动控制启动的服务

## 三、使用示例

### 1. Web 服务器自启动
```bash
# Nginx 容器，总是自动重启
docker run -d \
  --restart=always \
  --name nginx-web \
  -p 80:80 \
  nginx:latest
```

### 2. 数据库自启动
```bash
# MySQL 容器，总是自动重启
docker run -d \
  --restart=always \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=mysecret \
  -v mysql-data:/var/lib/mysql \
  mysql:5.7
```

### 3. 应用服务自启动（失败重试3次）
```bash
# Node.js 应用，失败时最多重试3次
docker run -d \
  --restart=on-failure:3 \
  --name node-app \
  -p 3000:3000 \
  my-node-app:latest
```

### 4. 修改现有容器的重启策略
```bash
# 将现有容器改为自动重启
docker update --restart=always container-name

# 将现有容器改为不自动重启
docker update --restart=no container-name
```

## 四、注意事项

1. **系统重启**
   - 设置了 `--restart=always` 的容器会在系统重启后自动启动
   - Docker 服务必须设置为开机自启，容器的自启动才能生效

2. **资源考虑**
   - 自启动容器会消耗系统资源
   - 建议只为关键服务设置自启动

3. **日志监控**
   - 对于自启动的容器，建议配置日志���控
   - 便于排查容器反复重启的问题

4. **依赖关系**
   - 如果容器之间有依赖关系，注意设置适当的启动顺序
   - 可以使用 Docker Compose 来管理容器依赖

5. **调试建议**
   - 在开发环境中谨慎使用 always
   - 使用 on-failure 并设置最大重试次数，便于发现问题 
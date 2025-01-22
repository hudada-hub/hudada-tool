# Docker 运行时挂载 Volume 指南

## 一、运行中容器挂载 Volume 的方法

由于 Docker 的限制，不能直接为运行中的容器添加新的挂载点。但我们有以下几种解决方案：

### 1. 使用 Docker Commit 方法
```bash
# 1. 停止当前容器
docker stop container_name

# 2. 创建容器的镜像
docker commit container_name new_image_name

# 3. 使用新镜像启动容器，并添加卷挂载
docker run -d \
  --name new_container \
  -v my_volume:/path/in/container \
  new_image_name
```

### 2. 使用 Docker CP 命令
```bash
# 1. 创建新的数据卷
docker volume create my_volume

# 2. 将容器中的数据复制到卷
docker cp container_name:/path/in/container/. $(docker volume inspect my_volume -f '{{.Mountpoint}}')

# 3. 停止并删除旧容器
docker stop container_name
docker rm container_name

# 4. 使用相同配置启动新容器，添加卷挂载
docker run -d \
  --name container_name \
  -v my_volume:/path/in/container \
  original_image_name
```

## 二、实际应用示例

### 1. 为运行中的 MySQL 容器添加数据卷
```bash
# 1. 创建数据卷
docker volume create mysql_data

# 2. 导出当前数据
docker exec mysql_container mysqldump -u root -p database_name > backup.sql

# 3. 停止容器并创建新镜像
docker stop mysql_container
docker commit mysql_container mysql_with_data

# 4. 启动新容器
docker run -d \
  --name mysql_new \
  -v mysql_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  mysql_with_data

# 5. 导入数据
docker exec -i mysql_new mysql -u root -p database_name < backup.sql
```

### 2. 为 Nginx 容器添加配置卷
```bash
# 1. 创建配置卷
docker volume create nginx_conf

# 2. 复制当前配置
docker cp nginx_container:/etc/nginx/conf.d/. $(docker volume inspect nginx_conf -f '{{.Mountpoint}}')

# 3. 创建新容器
docker run -d \
  --name nginx_new \
  -v nginx_conf:/etc/nginx/conf.d \
  -p 80:80 \
  nginx:alpine
```

## 三、数据迁移注意事项

### 1. 数据备份
```bash
# 备份容器数据
docker run --rm \
  --volumes-from source_container \
  -v $(pwd):/backup \
  alpine tar czf /backup/data.tar.gz /path/in/container
```

### 2. 权限处理
```bash
# 修正数据卷权限
docker run --rm \
  -v my_volume:/data \
  alpine chown -R user:group /data
```

### 3. 验证数据
```bash
# 检查数据完整性
docker run --rm \
  -v my_volume:/data \
  alpine ls -la /data
```

## 四、最佳实践

### 1. 提前规划
- 在启动容器前规划好卷挂载
- 使用命名卷而不是匿名卷
- 做好数据备份计划

### 2. 数据安全
```bash
# 创建备份
docker run --rm \
  -v my_volume:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/volume_backup.tar.gz -C /source .

# 定期备份脚本示例
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v my_volume:/source \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/backup_$DATE.tar.gz -C /source .
```

### 3. 性能考虑
- 避免大量小文件
- 使用适当的存储驱动
- 监控卷的使用情况

## 五、故障排除

### 1. 常见问题
```bash
# 检查卷挂载状态
docker inspect -f '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}' container_name

# 检查卷权限
docker run --rm -v my_volume:/data alpine ls -la /data

# 检查卷内容
docker run --rm -v my_volume:/data alpine find /data
```

### 2. 数据恢复
```bash
# 从备份恢复
docker run --rm \
  -v my_volume:/target \
  -v $(pwd):/backup \
  alpine sh -c "cd /target && tar xzf /backup/backup.tar.gz"
```

### 3. 清理操作
```bash
# 删除未使用的卷
docker volume prune

# 删除特定卷
docker volume rm my_volume

# 强制删除容��及其卷
docker rm -v container_name
```

## 六、监控和维护

### 1. 监控卷使用情况
```bash
# 查看卷信息
docker volume inspect my_volume

# 查看容器卷使用
docker ps -a --filter volume=my_volume

# 检查卷大小
docker system df -v
```

### 2. 定期维护
```bash
# 清理未使用的卷
docker volume prune --filter "label!=keep"

# 备份重要数据
docker run --rm \
  -v my_volume:/source \
  -v backup_volume:/backup \
  alpine cp -r /source/. /backup/
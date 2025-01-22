 # Docker Volume WordPress 应用示例

## 一、项目结构
```plaintext
wordpress-docker/
├── docker-compose.yml
├── nginx/
│   └── wordpress.conf
├── wordpress/
│   └── wp-content/
└── mysql/
    └── data/
```

## 二、Docker Compose 配置

```yaml
version: '3.8'

services:
  # WordPress 应用服务
  wordpress:
    image: wordpress:latest
    restart: always
    depends_on:
      - db
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress_password
      WORDPRESS_DB_NAME: wordpress
    volumes:
      # WordPress 内容目录持久化
      - wordpress_content:/var/www/html/wp-content
      # 上传文件目录
      - wordpress_uploads:/var/www/html/wp-content/uploads

  # MySQL 数据库服务
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress_password
      MYSQL_ROOT_PASSWORD: somewordpress
    volumes:
      # 数据库数据持久化
      - db_data:/var/lib/mysql
      # 数据库配置文件
      - ./mysql/conf.d:/etc/mysql/conf.d

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # Nginx 配置文件
      - ./nginx/wordpress.conf:/etc/nginx/conf.d/default.conf:ro
      # SSL 证书
      - ./nginx/ssl:/etc/nginx/ssl:ro
      # 静态文件缓存
      - nginx_cache:/var/cache/nginx
    depends_on:
      - wordpress

volumes:
  wordpress_content:
  wordpress_uploads:
  db_data:
  nginx_cache:
```

## 三、Volume 使用说明

### 1. WordPress 数据卷
```bash
# WordPress 内容目录
- wordpress_content:/var/www/html/wp-content
  用途：存储主题、插件等 WordPress 核心内容
  特点：需要持久化保存，便于升级和维护

# 上传文件目录
- wordpress_uploads:/var/www/html/wp-content/uploads
  用途：存储用户上传的图片等媒体文件
  特点：需要单独管理，便于备份和迁移
```

### 2. MySQL 数据卷
```bash
# 数据库数据
- db_data:/var/lib/mysql
  用途：存储数据库文件
  特点：需要持久化保存，关键数据

# 配置文件
- ./mysql/conf.d:/etc/mysql/conf.d
  用途：自定义 MySQL 配置
  特点：需要可修改，便于调优
```

### 3. Nginx 数据卷
```bash
# 配置文件
- ./nginx/wordpress.conf:/etc/nginx/conf.d/default.conf
  用途：Nginx 站点配置
  特点：只读挂载，保证配置安全

# 缓存目录
- nginx_cache:/var/cache/nginx
  用途：存储 Nginx 缓存文件
  特点：提升访问性能，可清理恢复
```

## 四、常用操作命令

### 1. 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 2. 数据管理
```bash
# 备份 WordPress 内容
docker run --rm \
  -v wordpress_content:/source \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/wp-content-$(date +%Y%m%d).tar.gz -C /source .

# 备份数据库
docker-compose exec db \
  mysqldump -u wordpress -pwordpress_password wordpress > backup.sql
```

### 3. 维护操作
```bash
# 清理 Nginx 缓存
docker-compose exec nginx rm -rf /var/cache/nginx/*

# 查看卷使用情况
docker volume ls
```

## 五、数据备份策略

### 1. 自动备份脚本
```bash
#!/bin/bash
# backup.sh

# 设置备份目录
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份 WordPress 内容
docker run --rm \
  -v wordpress_content:/source \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/wp-content_$DATE.tar.gz -C /source .

# 备份数据库
docker-compose exec -T db \
  mysqldump -u wordpress -pwordpress_password wordpress \
  > $BACKUP_DIR/wordpress_db_$DATE.sql

# 清理旧备份（保留7天）
find $BACKUP_DIR -type f -mtime +7 -delete
```

### 2. 定时任务配置
```bash
# 添加到 crontab
0 2 * * * /path/to/backup.sh
```

## 六、性能优化

### 1. MySQL 优化配置
```ini
# mysql/conf.d/custom.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
```

### 2. Nginx 缓存配置
```nginx
# nginx/wordpress.conf
fastcgi_cache_path /var/cache/nginx levels=1:2 keys_zone=wordpress:100m inactive=60m;
fastcgi_cache_key "$scheme$request_method$host$request_uri";
fastcgi_cache_use_stale error timeout invalid_header http_500;
fastcgi_cache_valid 200 60m;
```

## 七、故障处理

### 1. 常见问题解决
```bash
# 权限问题修复
docker-compose exec wordpress chown -R www-data:www-data /var/www/html/wp-content

# 数据库连接问题
docker-compose logs db
docker-compose restart db
```

### 2. 数据恢复
```bash
# 恢复 WordPress 内容
docker run --rm \
  -v wordpress_content:/target \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /target && tar xzf /backup/wp-content-20230101.tar.gz"

# 恢复数据库
docker-compose exec -T db mysql -u wordpress -pwordpress_password wordpress < backup.sql
```
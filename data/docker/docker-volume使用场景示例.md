# Docker Volume 使用场景示例

## 一、数据库持久化

### 1. MySQL 数据持久化
```yaml
version: '3'
services:
  mysql:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql    # 数据持久化
      - ./mysql/conf:/etc/mysql/conf.d    # 配置文件
      - ./mysql/init:/docker-entrypoint-initdb.d    # 初始化脚本
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=myapp
    ports:
      - "3306:3306"

volumes:
  mysql_data:    # 声明命名卷
```

### 2. MongoDB 数据持久化
```yaml
version: '3'
services:
  mongodb:
    image: mongo:latest
    volumes:
      - mongo_data:/data/db    # 数据持久化
      - mongo_config:/data/configdb    # 配置持久化
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    ports:
      - "27017:27017"

volumes:
  mongo_data:
  mongo_config:
```

## 二、Web 应用配置

### 1. Nginx 配置和静态文件
```yaml
version: '3'
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d    # 配置文件
      - ./nginx/ssl:/etc/nginx/ssl    # SSL 证书
      - web_content:/usr/share/nginx/html    # 静态文件
      - ./logs:/var/log/nginx    # 日志文件
    ports:
      - "80:80"
      - "443:443"

volumes:
  web_content:
```

### 2. Node.js 应用开发
```yaml
version: '3'
services:
  node_app:
    build: .
    volumes:
      - .:/app    # 源代码挂载
      - node_modules:/app/node_modules    # 依赖缓存
    ports:
      - "3000:3000"
    command: npm run dev

volumes:
  node_modules:    # 避免覆盖容器内的 node_modules
```

## 三、日志管理

### 1. ELK 日志收集
```yaml
version: '3'
services:
  elasticsearch:
    image: elasticsearch:7.9.3
    volumes:
      - es_data:/usr/share/elasticsearch/data    # 数据持久化
      - ./elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml    # 配置文件
  
  logstash:
    image: logstash:7.9.3
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline    # 管道配置
      - ./logs:/var/log/apps    # 应用日志
  
  kibana:
    image: kibana:7.9.3
    volumes:
      - ./kibana.yml:/usr/share/kibana/config/kibana.yml    # 配置文件

volumes:
  es_data:
```

### 2. 应用日志收集
```yaml
version: '3'
services:
  app:
    build: .
    volumes:
      - app_logs:/app/logs    # 应用日志
  
  log_processor:
    image: log-processor
    volumes:
      - app_logs:/logs:ro    # 只读方式挂载应用日志
      - processed_logs:/processed    # 处理后的日志

volumes:
  app_logs:
  processed_logs:
```

## 四、开发环境

### 1. 前端开发环境
```yaml
version: '3'
services:
  frontend:
    build: 
      context: .
      target: development
    volumes:
      - .:/app    # 源代码
      - node_modules:/app/node_modules    # 依赖
      - build_cache:/app/.cache    # 构建缓存
    ports:
      - "3000:3000"
    command: npm run dev

volumes:
  node_modules:
  build_cache:
```

### 2. 后端开发环境
```yaml
version: '3'
services:
  backend:
    build: .
    volumes:
      - .:/app    # 源代码
      - ~/.m2:/root/.m2    # Maven 缓存
      - gradle_cache:/root/.gradle    # Gradle 缓存
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev

volumes:
  gradle_cache:
```

## 五、数据备份

### 1. 数据库备份
```yaml
version: '3'
services:
  db:
    image: postgres:13
    volumes:
      - db_data:/var/lib/postgresql/data
  
  backup:
    image: postgres:13
    volumes:
      - db_data:/source/data:ro    # 只读挂载数据
      - ./backups:/backups    # 备份目录
    command: |
      pg_dump -h db -U postgres mydb > /backups/backup_$(date +%Y%m%d).sql
    depends_on:
      - db

volumes:
  db_data:
```

### 2. 定时备份
```yaml
version: '3'
services:
  backup_service:
    image: backup-service
    volumes:
      - data_volume:/data:ro    # 需要备份的数据
      - backup_volume:/backups    # 备份存储
    environment:
      - BACKUP_SCHEDULE=0 0 * * *    # 每天凌晨备份
      - RETENTION_DAYS=7    # 保留7天

volumes:
  data_volume:
  backup_volume:
```

## 六、特殊用例

### 1. 缓存加速
```yaml
version: '3'
services:
  app:
    build: .
    volumes:
      - build_cache:/app/.next    # Next.js 构建缓存
      - yarn_cache:/usr/local/share/.cache/yarn    # Yarn 缓存
      - npm_cache:/root/.npm    # NPM 缓存

volumes:
  build_cache:
  yarn_cache:
  npm_cache:
```

### 2. 共享数据
```yaml
version: '3'
services:
  producer:
    build: ./producer
    volumes:
      - shared_data:/data/shared    # 共享数据卷
  
  consumer:
    build: ./consumer
    volumes:
      - shared_data:/data/shared:ro    # 只读方式挂载共享数据

volumes:
  shared_data:
```

## 七、注意事项

1. **数据安全**
   - 使用命名卷而不是匿名卷
   - 定期备份重要数据
   - 合理设置访问权限

2. **性能考虑**
   - 避免挂载大量小文件
   - 使用适当的存储驱动
   - 合理使用缓存卷

3. **最佳实践**
   - 明确区分开发和生产环境的卷配置
   - 使用 .dockerignore 排除不必要的文件
   - 定期清理未使用的卷 
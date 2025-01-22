# Docker 镜像迁移指南

## 一、使用 save 和 load 命令

### 1. 保存镜像到文件
```bash
# 基本语法
docker save -o <输出文件名>.tar <镜像名称>:<标签>

# 示例
docker save -o my-app.tar my-app:v1
docker save -o nginx-custom.tar nginx:latest
```

### 2. 传输文件到服务器
```bash
# 使用 scp 命令
scp my-app.tar username@remote-server:/path/to/destination

# 使用 rsync 命令（推荐，支持断点续传）
rsync -avzP my-app.tar username@remote-server:/path/to/destination
```

### 3. 在服务器上加载镜像
```bash
# 基本语法
docker load -i <文件名>.tar

# 示例
docker load -i my-app.tar
```

## 二、使用 Docker Registry

### 1. 搭建私有仓库
```bash
# 在服务器上运行 Registry 容器
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  -v /mnt/registry:/var/lib/registry \
  registry:2
```

### 2. 推送镜像到私有仓库
```bash
# 1. 标记本地镜像
docker tag my-app:v1 server-ip:5000/my-app:v1

# 2. 推送镜像
docker push server-ip:5000/my-app:v1
```

### 3. 在服务器上拉取镜像
```bash
docker pull localhost:5000/my-app:v1
```

## 三、使用 Docker Hub

### 1. 推送到 Docker Hub
```bash
# 1. 登录 Docker Hub
docker login

# 2. 标记镜像
docker tag my-app:v1 username/my-app:v1

# 3. 推送镜像
docker push username/my-app:v1
```

### 2. 在服务器上拉取
```bash
# 1. 登录 Docker Hub（如果是私有镜像）
docker login

# 2. 拉取镜像
docker pull username/my-app:v1
```

## 四、最佳实践

### 1. 压缩传输文件
```bash
# 使用 gzip 压缩
docker save my-app:v1 | gzip > my-app.tar.gz

# 在服务器上解压并加载
gunzip -c my-app.tar.gz | docker load
```

### 2. 批量迁移
```bash
# 保存多个镜像
docker save -o images.tar image1:tag1 image2:tag2

# 使用脚本批量处理
for image in $(docker images --format "{{.Repository}}:{{.Tag}}"); do
  docker save $image | gzip > "${image//\//_}.tar.gz"
done
```

### 3. 验证迁移
```bash
# 检查镜像完整性
docker images

# 测试运行容器
docker run --rm my-app:v1 echo "Test successful"
```

## 五、注意事项

1. **镜像大小考虑**
   - 大型镜像建议使用压缩传输
   - 考虑使用多阶段构建减小镜像体积
   - 可以使用 `docker history` 查看镜像层信息

2. **网络因素**
   - 使用私有仓库时确保网络连通性
   - 大文件传输建议使��� rsync
   - 考虑使用镜像加速器

3. **安全性**
   - 使用 HTTPS 进行镜像传输
   - 定期清理不使用的镜像
   - 注意权限控制

4. **版本管理**
   - 使用明确的版本标签
   - 保留版本记录
   - 建议使用语义化版本号

## 六、常见问题解决

### 1. 磁盘空间不足
```bash
# 清理未使用的镜像
docker system prune -a

# 检查镜像和容器占用空间
docker system df
```

### 2. 传输中断
```bash
# 使用 rsync 断点续传
rsync -avzP --partial my-app.tar username@remote-server:/path/to/destination
```

### 3. 权限问题
```bash
# 修改文件权限
chmod 644 my-app.tar

# 修改目录权限
chmod 755 /path/to/registry
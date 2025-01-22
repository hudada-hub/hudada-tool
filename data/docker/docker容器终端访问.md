# Docker 容器终端访问指南

## 一、进入容器终端的方法

### 1. 使用 docker exec 命令
```bash
# 基本语法
docker exec -it 容器名称 SHELL命令

# Alpine 镜像（使用 sh）
docker exec -it 容器名称 /bin/sh

# Ubuntu/Debian 镜像（使用 bash）
docker exec -it 容器名称 /bin/bash
```

### 2. 不同基础镜像的 Shell 差异

1. **Alpine Linux**
   - 使用 `/bin/sh`
   - 更轻量级
   - 示例：`docker exec -it alpine-container /bin/sh`

2. **Ubuntu/Debian**
   - 使用 `/bin/bash`
   - 功能更完整
   - 示例：`docker exec -it ubuntu-container /bin/bash`

### 3. 为 Alpine 安装 bash
```bash
# 在 Dockerfile 中安装 bash
FROM alpine:latest
RUN apk add --no-cache bash

# 或在运行的容器中安装
docker exec -it 容器名称 /bin/sh
apk add --no-cache bash
```

## 二、常见使用场景

### 1. 调试容器
```bash
# 进入运行中的容器
docker exec -it 容器名称 /bin/sh

# 查看容器内进程
docker exec 容器名称 ps aux

# 查看容器日志
docker exec 容器名称 tail -f /var/log/nginx/access.log
```

### 2. 容器内执行命令
```bash
# 单次执行命令
docker exec 容器名称 ls -l

# 执行多个命令
docker exec 容器名称 sh -c "cd /app && ls -l"
```

### 3. 文件操作
```bash
# 在容器内创建文件
docker exec 容器名称 touch /tmp/test.txt

# 查看容器内文件
docker exec 容器名称 cat /etc/nginx/nginx.conf
```

## 三、最佳实践

### 1. 选择合适的基础镜像
```bash
# 开发环境（需要更多工具）
FROM ubuntu:20.04

# 生产环境（追求轻量）
FROM alpine:latest
```

### 2. 调试技巧
```bash
# 1. 安装常用工具
docker exec -it 容器名称 sh -c "apk add --no-cache curl wget vim"

# 2. 环境变量查看
docker exec -it 容器名称 env

# 3. 网络测试
docker exec -it 容器名称 ping localhost
```

### 3. 安全建议
- 生产环境尽量使用最小权限原则
- 不要在生产容器中安装不必要的工具
- 定期更新基础镜像以修复安全漏洞

## 四、常见问题解决

### 1. shell 不存在
```bash
# 错误
docker exec -it 容器名称 /bin/bash
# 错误信息：OCI runtime exec failed: exec failed: unable to start container process: exec: "/bin/bash": stat /bin/bash: no such file or directory: unknown

# 解决方法
docker exec -it 容器名称 /bin/sh
```

### 2. 交互式 Shell 无法使用
```bash
# 确保使用 -it 参数
docker exec -it 容器名称 /bin/sh

# -i: 保持标准输入打开
# -t: 分配伪终端
```

### 3. 容器内工具缺失
```bash
# Alpine 安装基本工具
docker exec -it 容器名称 sh -c "apk add --no-cache curl wget vim bash"

# Ubuntu/Debian 安装基本工具
docker exec -it 容器名称 bash -c "apt-get update && apt-get install -y curl wget vim"
# Docker System Prune 命令详解

`docker system prune` 是一个用于清理 Docker 系统资源的命令。使用 `-f` 或 `--force` 参数可以跳过确认提示直接执行清理。

## 基本语法

```bash
docker system prune [-f|--force] [-a|--all] [--volumes]
```

## 清理内容

该命令会移除：

1. 所有已停止的容器（container）
2. 所有未被使用的网络（network）
3. 所有悬空镜像（dangling images）
4. 所有构建缓存（build cache）

## 常用参数

- `-f, --force`：不提示确认直接删除
- `-a, --all`：删除所有未使用的镜像（不仅是悬空镜像）
- `--volumes`：同时删除未使用的数据卷

## 使用示例

```bash
# 基本清理（带确认提示）
docker system prune

# 强制清理（不带确认提示）
docker system prune -f

# 清理所有未使用的镜像和数据卷
docker system prune -af --volumes
```

## 使用场景

1. **开发环境清理**：
   - 清理测试过程中产生的临时容器和镜像
   - 释放磁盘空间

2. **CI/CD 环境**：
   - 自动化脚本中使用
   - 构建服务器定期清理

3. **生��环境维护**：
   - 系统空间不足时进行清理
   - 定期维护任务

## 注意事项

1. 该命令会删除：
   - 所有停止的容器
   - 所有未使用的网络
   - 所有悬空镜像
   - 所有构建缓存

2. 使用 `-a` 参数时会额外删除：
   - 所有未使用的镜像（包括非悬空镜像）

3. 使用 `--volumes` 参数时会删除：
   - 所有未使用的数据卷

4. 不会删除：
   - 正在运行的容器
   - 正在使用的镜像
   - 正在使用的网络
   - 正在使用的数据卷

## 最佳实践

```bash
# 1. 开发环境日常清理
docker system prune -f

# 2. 完整清理（包括所有未使用镜像和数据卷）
docker system prune -af --volumes

# 3. 在清理前查看空间使用情况
docker system df

# 4. 定期清理脚本示例
#!/bin/bash
echo "开始清理 Docker 系统..."
docker system prune -f
echo "清理完成"
```

## 相关命令

- `docker system df`：查看 Docker 磁盘使用情况
- `docker container prune`：仅清理容器
- `docker image prune`：仅清理镜像
- `docker network prune`：仅清理网络
- `docker volume prune`：仅清理数据卷

## 恢复策略

在执行清理前，建议：

1. 备份重要的数据卷
2. 记录重要的镜像标签
3. 确保所有需要保留的容器都在运行状态
4. 使用 `docker system df` 命令查看空间使用情况 
# Docker 基础概念和常用命令

## 一、Docker 核心概念

### 1. 镜像（Image）
- 一个只读的模板，包含创建 Docker 容器的说明
- 类似于虚拟机的快照，可以理解为一个面向Docker容器的只读模板
- 镜像可以重复使用，一个镜像可以创建多个容器

### 2. 容器（Container）
- 镜像的运行实例，可以被启动、停止、删除
- 每个容器都是相互隔离的、保证安全的平台
- 可以把容器看做是一个简易版的 Linux 系统

### 3. 仓库（Repository）
- 集中存放镜像的地方，类似于代码仓库
- Docker Hub是默认的镜像仓库
- 可以建立自己的私有仓库

## 二、常用 Docker 命令

### 1. 镜像相关命令
```bash
# 查看本地所有镜像
docker images

# 搜索镜像
docker search <镜像名>

# 拉取镜像
docker pull <镜像名>:<标签>

# 删除镜像
docker rmi <镜像ID>

# 构建镜像
docker build -t <镜像名>:<标签> .

# 查看镜像标签
# 1. 查看本地镜像标签
docker images <镜像名>

# 2. 查看远程仓库镜像标签（Docker Hub）
docker search <镜像名>                    # 搜索镜像
docker pull <镜像名>                      # 不指定标签默认拉取 latest
docker pull <镜像名>:<标签>               # 拉取指定标签的镜像

# 3. 获取远程镜像的全部标签
# 方法一：使用 curl 命令（官方API）
curl -L -s "https://registry.hub.docker.com/v2/repositories/library/镜像名/tags?page_size=1024" | jq '."results"[]["name"]'

# 方法二：使用 wget 命令
wget -q https://registry.hub.docker.com/v2/repositories/library/镜像名/tags?page_size=1024 -O - | jq '."results"[]["name"]'

# 示例：获取 nginx 的所有标签
curl -L -s "https://registry.hub.docker.com/v2/repositories/library/nginx/tags?page_size=1024" | jq '."results"[]["name"]'

# 示例：获取 ubuntu 的所有标签
curl -L -s "https://registry.hub.docker.com/v2/repositories/library/ubuntu/tags?page_size=1024" | jq '."results"[]["name"]'

# 4. 第三方仓库镜像标签（以阿里云为例）
# 登录阿里云容器镜像服务
docker login registry.cn-hangzhou.aliyuncs.com

# 查看阿里云镜像标签
curl -X GET https://registry.cn-hangzhou.aliyuncs.com/v2/<命名空间>/<仓库名>/tags/list

# 5. 使用 Docker Hub 网站查看
# 访问 https://hub.docker.com 搜索镜像，可以看到所有可用的标签

# 注意事项：
# - page_size=1024 表示每页显示的标签数量，可以根据需要调整
# - 如果镜像标签太多，需要分页获取
# - 私有仓库需要先进行认证
# - jq 命令需要预先安装：
#   Ubuntu/Debian: apt-get install jq
#   CentOS: yum install jq
#   MacOS: brew install jq
```

### 2. 容器相关命令
```bash
# 查看所有容器
docker ps -a

# 查看正在运行的容器
docker ps

# 启动容器
docker run [选项] <镜像名>
# 常用选项：
# -d: 后台运行
# -p: 端口映射，如 -p 8080:80
# --name: 指定容器名称

# 停止容器
docker stop <容器ID>

# 启动已停止的容器
docker start <容器ID>

# 重启容器
docker restart <容器ID>

# 删除容器
docker rm <容器ID>

### 3. Docker Run 命令详解
```bash
# 基本语法
docker run [选项] 镜像名[:标签] [命令] [参数]

# 常用选项详解：
# 1. 容器运行模式：
-i          # 交互式运行，保持标准输入打开
-t          # 分配一个伪终端
-d          # 后台运行容器（守护态运行）
--rm        # 容器退出后自动删除

# 2. 容器名称和网络：
--name      # 指定容器名称
-h          # 指定容器主机名
-p          # 端口映射，格式：主机端口:容器端口
    # 例如：-p 8080:80  将容器的80端口映射到主机的8080端口
    # 例如：-p 127.0.0.1:8080:80  指定主机IP的端口映射

# 3. 资源限制：
-m          # 内存限制，例如：-m 500M
--cpus      # CPU核心数限制，例如：--cpus=2
-v          # 挂载数据卷，格式：主机目录:容器目录
    # 例如���-v /home/data:/data

# 4. 环境和工作目录：
-e          # 设置环境变量，例如：-e MYSQL_ROOT_PASSWORD=123456
-w          # 设置工作目录，例如：-w /app

# 常见使用示例：
# 1. 运行一个交互式容器
docker run -it ubuntu:latest /bin/bash

# 2. 运行一个后台服务
docker run -d --name my-nginx -p 80:80 nginx

# 3. 运行并挂载数据卷的容器
docker run -d -v /host/data:/container/data mysql:5.7

# 4. 运行带环境变量的容器
docker run -d -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7

# 5. 运行带资源限制的容器
docker run -d --name limited-nginx -m 200M --cpus=0.5 nginx

# 6. 运行一个临时容器（用完即删）
docker run --rm -it alpine:latest sh
```

### 4. 容器操作命令
```bash
# 进入容器内部
docker exec -it <容器ID> /bin/bash

# 查看容器日志
docker logs <容器ID>

# 查看容器详细信息
docker inspect <容器ID>

# 复制文件到容器
docker cp <本地文件路径> <容器ID>:<容器内路径>
```

## 三、Dockerfile 基本指令

### 1. 常用指令
```dockerfile
# 基础镜像
FROM <镜像名>:<标签>

# 维护者信息
MAINTAINER <name>

# 执行命令
RUN <命令>

# 复制文件
COPY <源路径> <目标路径>

# 设置工作目录
WORKDIR <目录路径>

# 暴露端口
EXPOSE <端口>

# 容器启动时执行的命令
CMD ["executable","param1","param2"]

# 容器启动时执行的命令（不可被覆盖）
ENTRYPOINT ["executable", "param1", "param2"]
```

## 四、Docker 网络

### 1. 网络模式
- bridge：默认网络模式，容器通过网桥接入网络
- host：容器和主机共享网络
- none：容器没有网络连接
- container：与其他容器共享网络

### 2. 网络命令
```bash
# 查看网络列表
docker network ls

# 创建网络
docker network create <网络名>

# 连接容器到网络
docker network connect <网络名> <容器ID>
```

## 五、Docker 数据卷

### 1. 数据卷操作
```bash
# 创建数据卷
docker volume create <卷名>

# 查看所有数据卷
docker volume ls

# 查看数据卷详细信息
docker volume inspect <卷名>

# 删除数据卷
docker volume rm <卷名>
```

### 2. 挂载数据卷
```bash
# 在运行容器时挂载
docker run -v <卷名>:<容器内路径> <镜像名>

# 挂载主机目录
docker run -v <主机路径>:<容器内路径> <镜像名>


docker run -d \
  --name prod-app \
  --restart always \
  -p 80:80 \
  my-app:latest 自动重启
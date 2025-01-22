镜像源大全:https://github.com/dongyubin/DockerHub
{
"experimental": true,
"features": {
"buildkit": true
},
"log-driver": "json-file",
"log-opts": {
"max-size": "10m",
"max-file": "3"
},
"timeout": 120,
"http-client-timeout": 120,
"registry-mirrors": [
       "https://docker.hpcloud.cloud",
    "https://docker.m.daocloud.io",
    "https://docker.unsee.tech",
    "https://docker.1panel.live",
    "http://mirrors.ustc.edu.cn",
    "https://docker.chenby.cn",
    "http://mirror.azure.cn",
    "https://dockerpull.org",
    "https://dockerhub.icu",
    "https://hub.rat.dev",
    "https://proxy.1panel.live",
    "https://docker.1panel.top",
    "https://docker.m.daocloud.io",
    "https://docker.1ms.run",
    "https://docker.ketches.cn",
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://docker.m.daocloud.io", 
    "https://noohub.ru", 
    "https://huecker.io",
    "https://dockerhub.timeweb.cloud",
    "https://0c105db5188026850f80c001def654a0.mirror.swr.myhuaweicloud.com",
    "https://5tqw56kt.mirror.aliyuncs.com",
    "https://docker.1panel.live",
    "http://mirrors.ustc.edu.cn/",
    "http://mirror.azure.cn/",
    "https://hub.rat.dev/",
    "https://docker.ckyl.me/",
    "https://docker.chenby.cn",
    "https://docker.hpcloud.cloud",
    "https://docker.m.daocloud.io"

],
"dns": ["8.8.8.8", "8.8.4.4"]
}

windows:
1.下载 https://www.docker.com/get-started/

hub地址:https://hub.docker.com/
yum install docker        # CentOS 中安装
apt-get install docker-ce # Ubuntu 中安装

安装docker:bash <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/DockerInstallation.sh)
推荐:
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
linux管理:https://kejilion.sh/
docker pull nginx
构建镜像：docker build -t numswitch .
运行容器：docker run -d -p 3000:80 --name numswitch-demo numswitch
启动本地 然后直接输入serve
npm install --global serve

docker环境

安装环境

curl -fsSL https://get.docker.com | sh

sudo tee /etc/docker/daemon.json <<EOF
{
"registry-mirrors": ["https://docker.anyhub.us.kg"]
}
EOF
systemctl daemon-reload&& systemctl restart docker

启动环境

systemctl start docker

开机自启动环境

systemctl enable docker

查看docker环境版本

docker --version

容器

部署新容器

docker run -d --name nginx --restart always -p 80:80 -p 443:443 -v /home/docker/nginx/conf.d:/etc/nginx/conf.d -v /home/docker/nginx/certs:/etc/nginx/certs -v /home/docker/nginx/html:/var/www/html nginx:latest

docker run -d --name nextcloud --restart=always -p 8080:80 -v /home/docker/nextcloud:/var/www/html -e NEXTCLOUD_ADMIN_USER=kejilion -e NEXTCLOUD_ADMIN_PASSWORD=kejilionYYDS nextcloud

查看所有容器

docker ps -a

查看运行的容器

docker ps

启动容器

docker start nginx

暂停容器

docker stop nginx

删除容器

docker rm nginx

强制删除容器

docker rm -f nginx



启动所有容器

docker start $(sudo docker ps -a -q)

暂停所有容器

docker stop $(sudo docker ps -a -q)

暂停所有容器

docker rm -f $(sudo docker ps -a -q)

进入容器

docker exec -it nginx bash

查看容器日志

docker logs nginx
devops是一种思想,是一种管理模式,是一种执行规范与标准.它主要是用于促进开发/测试与运维部门间的沟通协作



}
镜像源:# Windows下，编辑 %userprofile%\.docker\daemon.json
# Linux下，编辑 /etc/docker/daemon.json



# 清理之前的构建缓存和镜像
docker system prune -f
docker rmi docker-fe:v1

# 重新构建
docker build -t docker-fe:v1 .


docker有趣应用:https://blog.kejilion.pro/dockeapp/



{
"dns": [
"8.8.8.8",
"8.8.4.4"
],

"registry-mirrors": ["https://docker.registry.cyou",
"https://docker-cf.registry.cyou",
"https://dockercf.jsdelivr.fyi",
"https://docker.jsdelivr.fyi",
"https://dockertest.jsdelivr.fyi",
"https://mirror.aliyuncs.com",
"https://dockerproxy.com",
"https://mirror.baidubce.com",
"https://docker.m.daocloud.io",
"https://docker.nju.edu.cn",
"https://docker.mirrors.sjtug.sjtu.edu.cn",
"https://docker.mirrors.ustc.edu.cn",
"https://mirror.iscas.ac.cn",
"https://docker.rainbond.cc"]


}



完全关闭 Docker Desktop
# 管理员 PowerShell 中执行
taskkill /f /im "Docker Desktop.exe"
taskkill /f /im "com.docker.backend.exe"
taskkill /f /im "com.docker.proxy.exe"
taskkill /f /im "com.docker.service"
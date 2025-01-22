程序员快捷搜索本地文档命令行工具

作为一名程序员,你是否有这样的烦恼
1. 常常记不住常用的命令,比如linux命令,docker命令,git命令等
2. 在本地记录了一些笔记,需要用到的时候,还需要打开这些笔记,然后去搜索,再去使用

效果图:

安装:


使用:

1. 搜索

`my 文件夹|文件 -s 关键词`

 `my git add.md -s add` : 在git文件夹下add.md文件,搜索commit关键词


 如果是文件夹
` my git` 则显示文件夹的所有文件


# 添加目录
`my -d /path/to/dir`

# 删除目录 (使用新的 -r 选项)
`my -r /path/to/dir`

# 列出所有目录
`my -l`


# 支持查看的文件类型
`['.md', '.txt', '.html', '.js', '.json', '.css', '.ts', '.tsx', '.conf']`


也可查看图片类型:
`['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']`


# 预览
`my preview`

# ai
`my ai 内容`

# 配置ai key
`my ai key 你的key`

# 翻译
`my t 翻译内容`


# 颜色转换
`my color rgb转hex`


# HEX 转 RGB
`my color #FF0000`

# RGB 转 HEX
`my color rgb(255,0,0)`

# 支持空格
`my color rgb(255, 0, 0)`


# 启动vscode
`my vs`


# 时间
`my date`

# 打开文件
my vs .           # 打开当前文件夹
my vs C:\e        # 打开指定绝对路径
my vs folder      # 打开相对路径
my vs            # 打开当前文件夹（不带参数）



# 复制文件
my cp source.txt target/dest.txt

# 复制目录
my cp source_dir target_dir

# 使用绝对路径
my cp /path/to/source.txt D:/path/to/dest.txt





# 移动文件
my mv source.txt target/dest.txt

# 重命名文件
my mv old.txt new.txt

# 移动目录
my mv source_dir target_dir

# 使用绝对路径
my mv /path/to/source.txt D:/path/to/dest.txt



my mkdir test              # 在当前目录创建目录
my mkdir path/to/dir       # 创建多级目录
my mkdir D:/temp/test      # 使用绝对路径创建目录



my touch test.txt           # 在当前目录创建文件
my touch folder/test.txt    # 创建文件并自动创建目录
my touch D:/temp/test.txt   # 使用绝对路径创建文件




my rm ./test.txt          # 删除当前目录下的文件
my rm ../backup           # 删除上级目录中的目录
my rm D:/temp/data.json   # 删除绝对路径的文件



my ls :

当前目录: D:\projects\test

权限         大小         类型         修改时间                    名称
────────────────────────────────────────────────────────────────────────────
rwxrwxrwx    156.2 MB    目录         2024-01-26 14:30          node_modules
rwxrwxrwx    2.5 MB      目录         2024-01-26 14:30          dist
rwxrwxrwx    1.8 MB      目录         2024-01-26 14:30          src
rwxrwxrwx    2.5 KB      文本文件     2024-01-26 14:30          package.json
rwxrwxrwx    1.2 MB      图片         2024-01-26 14:30          logo.png

共 3 个目录，2 个文件，总大小 161.7 MB



my kill 3000:
正在查找使用端口 3000 的进程...

找到以下进程:
PID: 1234    进程名: node.exe
PID: 5678    进程名: nginx.exe

✓ 已终止进程 1234 (node.exe)
✓ 已终止进程 5678 (nginx.exe)

端口 3000 已释放


# 压缩文件
my zip file.txt                    # 生成 file.txt.zip
my zip file.txt archive.zip        # 指定输出文件名

# 压缩目录
my zip source_dir                  # 生成 source_dir.zip
my zip source_dir backup.zip       # 指定输出文件名

# 使用绝对路径
my zip D:/path/to/file.txt


# 解压到当前目录
my unzip archive.zip

# 解压到指定目录
my unzip archive.zip output_dir

# 使用绝对路径
my unzip D:/downloads/archive.zip D:/output




# 基本搜索
my find .                     # 列出所有文件和目录
my find . "*.txt"            # 搜索所有 txt 文件

# 按类型搜索
my find . "-type=f"          # 只搜索文件
my find . "-type=d"          # 只搜索目录

# 按大小搜索
my find . "-size=>1MB"       # 搜索大于 1MB 的文件
my find . "-size=<100KB"     # 搜索小于 100KB 的文件

# 按扩展名搜索
my find . "-ext=js"          # 搜索所有 JS 文件

# 按修改时间搜索
my find . "-mtime=7"         # 搜索7天内修改的文件

# 限制搜索深度
my find . "-maxdepth=2"      # 最多搜索2层目录


## my os

系统信息:

基本信息:
操作系统:     Windows 10 10.0.19045
计算机名:     DESKTOP-ABC123
系统架构:     x64
系统平台:     win32
用户目录:     C:\Users\username
系统运行时间: 5天 3小时 45分钟

CPU信息:
处理器:       Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
核心数:       8
主频:         3.80 GHz
CPU使用率:    35.2%

内存信息:
总内存:       32.00 GB
已用内存:     16.45 GB
可用内存:     15.55 GB
内存使用率:   51.4%
使用情况:     ███████████████░░░░░░░░░░░░░

磁盘信息:
C盘:
  总大小:     512.00 GB
  已用空间:   325.68 GB
  可用空间:   186.32 GB
  使用率:     63.6%

D盘:
  总大小:     1.00 TB
  已用空间:   756.25 GB
  可用空间:   267.75 GB
  使用率:     73.9%

网络信息:
接口名称:     以太网
IP地址:       192.168.1.100
MAC地址:      00:11:22:33:44:55
子网掩码:     255.255.255.0
协议族:       IPv4




# 显示当前 PATH
my path
my path list

# 添加路径
my path add /usr/local/bin
my path add ./node_modules/.bin

# 移除路径
my path remove /usr/local/bin


# 查看 hosts 文件
my host
my host list

# 添加 hosts 记录
my host add 127.0.0.1 example.com

# 删除 hosts 记录
my host remove example.com
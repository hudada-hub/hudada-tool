不要轻易更改package.json的依赖版本，否则会导致不可预期的问题

* 
* 查找npm目录：`npm config get prefix`
### `npm link`：创建链接
* 可在本项目使用
* 可全局使用


.npm install puppeteer一直等待中，安装失败
在package.json同级目录创建.npmrc文件
写入,配置自己的chrome浏览器安装地址
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

.npm配置镜像源
npm config set registry https://registry.npmmirror.com

.npm 获取镜像源
npm config get registry

.临时使用镜像源
npm install package-name --registry=https://registry.npmmirror.com


npm search package:搜索包
npm docs package:浏览器获得官网

npm outdated:检查过时的包
npm update [pkg]:更新所有包
npm update [pkg] -g: 更新所有全局包

npm view <package_name> versions:查看包的所有版本

npm-check-updates是一个npm包，可以检查并更新package.json中的依赖项到最新版本。

npm install -g npm-check-updates
ncu -u


npm list <package>:列出项目依赖


npm publish:发布包
npm search <package>:搜索包

npm run :查看可运行的scripts里的命令

安装具体版本的包:npm i vue@3.0.0


在更新依赖之前先备份 package.json
更新后测试应用确保一切正常
对于重要的生产应用，建议逐个更新依赖并测试
使用 package-lock.json 确保团队使用相同的依赖版本


版本号:x,y,z
x:主版本号:当你做了不可兼容的API修改,可能不兼容之前的版本

y:次版本号,当你做了向下兼容的功能性增强,新功能增加,但是兼容之前的版本

z修订号:当你做了向下兼容的问题修正,没有新功能,修复了之前版本的bug




x.y.z:表示一个明确的版本号
^x.y.z:表示x不变,y和z永远是最新的版本

~x.y.z:表示x和y不变,z永远是最新的版本


查看全局包路径:npm root -g

查看已安装的全局包列表:npm list -g --depth=0


# 设置新的全局包路径
npm config set prefix "新路径"

记得将全局包的 bin 目录添加到系统 PATH

 npm config get cache :获取缓存路径

npm cache clean --force :清除缓存
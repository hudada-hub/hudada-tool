静态网页部署：
新建一个仓库，取名[你的用户名.github.io],然后把代码推送到远程，然后等待几分钟就可以了
* 
* 获取组织仓库列表信息
  * https://api.github.com/orgs/hudada-hub/repos
* 获取个人仓库列表信息
  * https://api.github.com/users/hudada-hub/repos
* 获取指定仓库版本号
  * https://api.github.com/repos/hudada-hub/create-nm/tags
* 查询访问次数
  * curl -i https://api.github.com/users/octocat
  * headers:{"Authorization":token+你的token}

#### token获取
> github->settings->Developer Settings->persona access tokens
> 
> 
> 现在主分支是main了,不是master了

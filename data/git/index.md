

git两种管理方式：
1. 共用一个仓库，不同的开发人员用不同的分支
2. 公司主仓库不直接开发，成员把仓库fork到自己的账号下，然后开发，然后申请pull requests合并

推送：git push -u origin master
git push origin HEAD:master

添加远程仓库：git remote add origin https://e.coding.net/cloudbase-100003612876/studyfontend/wechat.git
查看git 远程信息
git remote -v

修改
git remote set-url origin https://xxx.git


移出暂存区文件：git rm 文件
修改最后的commit信息:git commit --amend 
查看提交记录：git log

回滚到某次提交：git reset --hard <commit-hash>

推送到远程分支：git push origin HEAD:master

查看当前分支：git branch

git branch -d 分支名 删除分支
git branch 分支名 新建分支

切换到tss-dve分支：git checkout -b tss-dev  # -b是切换并且新建


如果当前分支为master分支：
合并tss-dev分支:
git pull # 先pull一下，以免master分支改了我们不知道
git merge tss-dev
如果合并没冲突，成功则
git push推到线上

如果git有多个账号，管理账号：控制面板的凭据管理器，windows凭据

如果fork的仓库合并到主仓库：点击pull requests选项


本地比线上有落后，会无法push到线上，因为本地比线上落后了一个版本
合并冲突解决方式
1. 先pull一下，如果产生代码冲突

<<<<<<< HEAD
console.log('完成了f'')
=======
console.log(完成了e)
>>>>>>>>>

<<<<<<< HEAD是本地版本
>>>>>>>>> 是本地的，你要选择要线上的，还是线下的
> 
在保留自己的代码或者保留别人的代码或者两个代码都保留后，
git add .
git commit -m '解决冲突'
git push

如果hook钩子commit不了，加上--no-verify参数


删除tag:git tag -d v1.0.1
添加tag:> git tag v1.0.1
git push origin v1.0.1 -f

用命令行提交，末尾追加--no-verify
git commit -m '千古壹号的commit备注' --no-verify

# 推送到远程时，也可以追加 --no-verify，以免远程仓库做了 eslint 限制。
git push origin --no-verify


全局添加git信息,git log下可查看谁提交了
git config --global user.name "smyhvae"

git config --global user.email "smyhvae@163.com"


git init my_project 初始化git 创建my_project文件夹


git submodule add https://github.com/30-seconds/30-seconds-of-code ./30code 添加子模块
git config --global alias.co checkout  设置别名
git stash apply
git config --global help.autocorrect 1 自动更正
git clone https://github.com/30-seconds/30-seconds-of-code.git my-project 克隆


git config --global user.email "cool.duck@qua.ck"
git config --global user.name "Duck Quackers" 配置用户


git branch 查看所有分支
git checkout -b patch-1 创建分支
git checkout -b patch-2 -t origin/patch-2
git branch -d patch-1 删除分支
git push -d origin patch-1 删除远程分支

git branch -m patch-1 patch-2 重命名分支

git checkout master
git branch -m patch-1 patch-2    # Renamed the local branch to `patch-2`
git push origin --delete patch-1
git checkout patch-2
git push origin -u patch-2 # Renames the remote branch to `patch-2` 重命名远程分支


git checkout patch-1 切花分支

```shell 切换到上一个分支
git checkout patch-1
git checkout master
git checkout - # Switches to `patch-1`
```



git add .
git commit -m "Fix the network bug"


git fetch origin 从远程检索到最新
git checkout master
git reset --hard origin/master重置最新的远程到本地

git rm —-cached "30-seconds.txt" 从commit中删除文件
git commit —-amend 修改

git stash apply
git stash apply stash@{1}


```shell
git bisect start
git bisect good 3050fc0de
git bisect bad c191f90c7
git bisect run npm test # Run `npm test` for each commit
# ... some time later the bad commit will be printed
git bisect reset # Goes to the original branch
```

git branch --contains 3050fc0
git remote set-url origin https://github.com/30-seconds/30-seconds-of-code

git submodule update --init --recursive

git config commit.template "commit-template"

git commit --no-verify -m "Unsafe commit"
git checkout patch-1 "30seconds.txt"

git checkout -b patch-2 -t origin/patch-2

git commit --fixup 3050fc0de
# Created a fixup commit for `3050fc0de`
git rebase HEAD~5 --autosquash

git checkout patch-1
git rev-parse --abbrev-ref HEAD # Prints `patch-1`
git fetch --all --prune

git branch --merged master | grep -v "(^\*|master)" | xargs git branch -d

git stash drop stash@{1} # Deletes `stash@{1}`

git stash clear

git submodule deinit -f -- 30code
rm -rf .git/modules/30code
git rm -f 30code

git diff patch-1..patch-2

git clean -f -d

git config --global -e

git fsck --lost-found

git rebase master

git rebase -i 3050fc0de

git stash list

git rebase -i --autosquash HEAD~5

git bisect start
git bisect good 3050fc0de
git bisect bad c191f90c7
git bisect good # Current commit is good
git bisect bad # Current commit is buggy
# ... some time later the bad commit will be printed
git bisect reset # Goes to the original branch


git checkout master
git add .
git commit -m "Fix network bug"
git branch patch-1
# `patch-1` branch is created containing the commit "Fix network bug"
git reset HEAD~1 --hard # Remove the commit from `master`
git checkout patch-1

git gc --prune=now --aggressive # Optimizes the local repository

git cherry-pick 3050fc0de # Picks changes from the commit `3050fc0de`

git cherry-pick 3050fc0de c191f90c7
# Picks changes from the commits `3050fc0de`, `c191f90c7` and `0b552a6d4`

git cherry-pick 3050fc0de..c191f90c7
# Picks changes from the commits in the range `3050fc0de` - `c191f90c7`

git submodule update --recursive --remote


git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch config/apiKeys.json" \
--prune-empty --tag-name-filter cat -- --all
# Purges `config/apiKeys.json` from history
git push origin --force --all
# Force pushes the changes to the remote repository



git stash save
# Creates a new stash

git stash save -u
# Creates a new stash, including untracked files

git stash save "Bugfix WIP"
# Creates a new stash with the message "Bugfix WIP"


git config --global push.default current

git checkout -b my-branch
git push -u
# Pushes to origin/my-branch


git commit -m "Fix the network bug" --author="Duck Quackers <cool.duck@qua.ck>"

git config --global core.editor "code --wait"

git branch --sort=-committerdate

git revert 3050fc0

git revert HEAD


git restore --staged "30seconds.txt"
# Remove the file `30seconds.txt` from the staging area

git restore --staged src/*.json
# Remove all files with a `.json` extension in the `src` directory

git restore --staged .
# Remove all changes from the staging area


# Syntax: git commit --amend -m <message>

git add .
git commit -m "Fix the network bug"
# Creates the commit: 3050fc0 Fix network bug

git commit --amend -m "Fix the network bug"
# The last commit's message is now "Fix the network bug"
# This also changes its SHA-1 checksum


git add .
git commit -m "Fix the network bug"
# Creates the commit: 3050fc0 Fix network bug

# Edit or add files
git add .
git commit --amend --no-edit
# The last commit includes the edited/added files
# This also changes its SHA-1 checksum

git shortlog 3050fc0de..HEAD

git log --pretty=oneline --graph --decorate --all
# * 3050fc0de Fix network bug
# * c191f90c7 Initial commit

git log --author="Duck Quacking"
# commit c191f90c7766ee6d5f24e90b552a6d446f0d02e4
# Author: 30 seconds of code
# Date: Tue Apr 6 11:11:08 2021 +0300
# [...]

git log -S"30-seconds"
# commit c191f90c7766ee6d5f24e90b552a6d446f0d02e4
# Author: 30 seconds of code
# Date: Tue Apr 6 11:11:08 2021 +0300
# [...]


git log --since='Apr 1 2021' --until='Apr 4 2021'
# commit c191f90c7766ee6d5f24e90b552a6d446f0d02e4
# Author: 30 seconds of code
# Date: Tue Apr 6 11:11:08 2021 +0300
# [...]

git log --since='2 weeks ago'
# commit c191f90c7766ee6d5f24e90b552a6d446f0d02e4
# Author: 30 seconds of code
# Date: Tue Apr 6 11:11:08 2021 +0300
# [...]

git log --oneline --no-merges
# 3050fc0 Fix network bug
# c191f90 Initial commit


git diff
# Displays the differences between unstaged changes and the last commit

git diff --staged
# Displays the differences between staged changes and the last commit


git log -1
# commit c191f90c7766ee6d5f24e90b552a6d446f0d02e4
# Author: 30 seconds of code
# Date: Tue Apr 6 11:11:08 2021 +0300
# [...]

git checkout master
git branch -a --merged
# patch-1
# patch-2


git config --get remote.origin.url
# https://github.com/30-seconds/30-seconds-of-code

git status -sb
# ## patch-1...origin/patch-1
# ?? 30-seconds.txt

git reset --hard 3050fc0de # Go back to the commit with the given hash

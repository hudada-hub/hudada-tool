# git branch

`git branch`是分支操作命令。

```bash
# 列出所有本地分支
$ git branch

# 列出所有本地分支和远程分支
$ git branch -a
```

（1）新建一个分支

直接在`git branch`后面跟上分支名，就表示新建该分支。

```bash
$ git branch develop
```

新建一个分支，指向当前 commit。本质是在`refs/heads/`目录中生成一个文件，文件名为分支名，内容为当前 commit 的哈希值。

注意，创建后，还是停留在原来分支，需要用`git checkout`切换到新建分支。

```bash
$ git checkout develop
```

使用`-b`参数，可以新建的同时，切换到新分支。

```bash
$ git checkout -b NewBranch MyBranch
```

（2）删除分支

`-d`参数用来删除一个分支，前提是该分支没有未合并的变动。

```bash
$ git branch -d <分支名>
```

强制删除一个分支，不管有没有未合并变化。

```bash
$ git branch -D <分支名>
```

（3）分支改名

```bash
$ git checkout -b twitter-experiment feature132
$ git branch -d feature132
```

另一种写法

```bash
# 为当前分支改名
$ git branch -m twitter-experiment

# 为指定分支改名
$ git branch -m feature132 twitter-experiment

# 如果有重名分支，强制改名
$ git branch -m feature132 twitter-experiment
```

（4）查看 merge 情况

```bash
# Shows branches that are all merged in to your current branch
$ git branch --merged

# Shows branches that are not merged in to your current branch
$ git branch --no-merged
```

## 命令行参数

### -d

`-d`参数用于删除一个指定分支。

```bash
$ git branch -d <branchname>
```
# 分支

分支（branch）是 Git 最重要的概念之一，几乎所有 Git 操作流程都离不开分支。

本质上，分支只是一个动态指针（或者称为标签），指向某个提交（commit）。所谓“动态”，指的是当你切换到当前分支，生成新的 commit 时，分支就会自动更新，指向这个新的 commit。

## 查看分支

`git status`命令查看当前是哪一个分支。

```bash
$ git status
```

`git branch`命令可以列出所有的本地分支。

```bash
$ git branch
```

`-r`参数查看所有的远程分支。

```bash
$ git branch -r
```

`-a`参数查看所有分支（包含本地和远程）。

```bash
$ git branch -a
```

## 创建分支

`git branch`命令紧跟一个分支名，就可以创建该分支。注意，该命令不会切换分支，创建后依然停留在当前分支。

```bash
$ git branch MyBranch
```

上面命令创建了一个`MyBranch`分支，创建后并不会切换到`MyBranch`分支。

`git checkout`命令也可以创建分支，并且创建后会切换到该分支。

```bash
$ git checkout -b MyBranch
```

上面命令创建`MyBranch`分支，然后切换到该分支。

`git push`命令可以创建远程分支，并且与本地同名分支建立对应关系。

```bash
$ git push -u origin MyBranch
```

上面命令在远程`origin`仓库创建了`MyBranch`分支，并且与本地的`MyBranch`分支建立对应关系。

创建远程的同名当前分支，可以使用下面的命令。

```bash
$ git push -u origin HEAD
```

上面命令中，`HEAD`是 Git 自带的动态指针，总是指向当前的本地分支。

## 切换分支

`git checkout`命令用来切换分支。

```bash
$ git checkout MyBranch
```

上面命令会切换到一个现有分支`MyBranch`，当前工作区会变成`MyBranch`的内容。

`git checkout`命令也可以切换到远程分支。

```bash
$ git checkout --track origin/MyBranch
```

上面命令切换到远程的`MyBranch`分支。执行该命令之前，最好先执行`git pull`命令，将远程的内容都拉取到本地。

## 分支改名

`git branch`命令的`-m`参数可以为当前分支改名。

```bash
$ git branch -m MyBranch
```

上面命令将当前分支改名为`MyBranch`。

## 删除分支

`git branch`的`-d`参数可以删除分支。

```bash
$ git branch -d MyBranch
```

上面命令删除`MyBranch`分支，前提是该分支没有未合并的变动。

`-D`参数会强制删除分支，不管有没有未合并变动。

```bash
$ git branch -D MyBranch
```

`git push`命令可以删除远程分支。

```bash
$ git push origin --delete MyBranch
```

上面命令删除了远程的`MyBranch`分支。



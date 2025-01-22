# 更新补丁版本 1.0.0 -> 1.0.1
npm version patch

# 更新次要版本 1.0.0 -> 1.1.0
npm version minor

# 更新主要版本 1.0.0 -> 2.0.0
npm version major

# 指定具体版本
npm version 1.2.3

预发布版本：
# Alpha 版本 1.0.0 -> 1.0.1-alpha.0
npm version prerelease --preid=alpha

# Beta 版本 1.0.0 -> 1.0.1-beta.0
npm version prerelease --preid=beta

# Release Candidate 1.0.0 -> 1.0.1-rc.0
npm version prerelease --preid=rc




常用选项：

# 不创建 git tag
npm version patch --no-git-tag-version

# 不执行 git commit
npm version patch --no-commit-hooks

# 指定提交信息
npm version patch -m "Upgrade to %s"

# 强制更新（即使 git 工作目录不干净）
npm version patch --force

生命周期脚本：

```json
{
  "scripts": {
    "preversion": "npm test",      // 版本更新前运行
    "version": "npm run build",    // 版本更新时运行
    "postversion": "git push && git push --tags"  // 版本更新后运行
  }
}
```


工作区（Workspaces）支持：

# 更新所有工作区包
npm version patch --workspaces

# 更新指定工作区包
npm version patch --workspace=package-name


版本号规则：
主版本号.次版本号.修订号[-预发布标识符][+构建标识符]
1.0.0-alpha.1+20231207


实际应用示例：

```js
// 发布工作流
async function release() {
  try {
    // 1. 运行测试
    await exec('npm test');

    // 2. 更新版本
    const newVersion = await exec('npm version patch');

    // 3. 生成变更日志
    await exec('npm run changelog');

    // 4. 构建
    await exec('npm run build');

    // 5. 发布
    await exec('npm publish');

    // 6. 推送到远程
    await exec('git push && git push --tags');

  } catch (error) {
    console.error('发布失败:', error);
    process.exit(1);
  }
}

```
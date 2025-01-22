# 方式 1：Windows 系统环境变量（推荐，永久有效）
setx NPM_TOKEN "your_npm_token_here"
setx GITHUB_TOKEN "your_github_token_here"

# 方式 2：当前会话（临时）
set NPM_TOKEN=your_npm_token_here
set GITHUB_TOKEN=your_github_token_here

# 方式 3：创建 .env 文件（项目级别）
cp .env.example .env
# 然后编辑 .env 文件填入实际的令牌值




# 验证 NPM 令牌
npm whoami

# 验证 GitHub 令牌
curl -H "Authorization: token xxxxxxxxxxxxxx" https://api.github.com/user

# 测试发布配置
npm run release -- --dry-run

# NPM 高级特性指南



改变日志记录格式：https://keepachangelog.com/en/1.1.0/


## 1. 工作区（Workspaces）

### 1.1 基本概念
Workspaces 允许我们在一个仓库中管理多个包，适用于 monorepo 项目。

```json
// package.json
{
  "workspaces": [
    "packages/*"
  ]
}
```

### 1.2 常用命令
```bash
# 在指定工作区执行命令
npm run test --workspace=package-name

# 在所有工作区执行命令
npm run test --workspaces
```

## 2. npm scripts 高级用法

### 2.1 生命周期脚本
```json
{
  "scripts": {
    "preinstall": "echo '安装前执行'",
    "install": "echo '安装时执行'",
    "postinstall": "echo '安装后执行'",
    "prepublish": "npm test",
    "publish": "echo '发布中'",
    "postpublish": "echo '发布完成'"
  }
}
```

### 2.2 并行与串行执行
```json
{
  "scripts": {
    "parallel": "npm run task1 & npm run task2",
    "sequential": "npm run task1 && npm run task2"
  }
}
```

### 2.3 跨平台命令
```json
{
  "scripts": {
    "clean": "rimraf dist",
    "copy": "copyfiles -u 1 src/**/*.html dist"
  }
}
```

## 3. 依赖管理高级特性

### 3.1 peer dependencies
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### 3.2 optional dependencies
```json
{
  "optionalDependencies": {
    "optional-package": "^1.0.0"
  }
}
```

### 3.3 bundled dependencies
```json
{
  "bundledDependencies": [
    "package-name"
  ]
}
```

## 4. npm 配置管理

### 4.1 .npmrc 文件
```ini
registry=https://registry.npm.taobao.org/
save-exact=true
package-lock=false
```

### 4.2 环境变量
```bash
# 设置环境变量
npm config set production true

# 使用环境变量
process.env.NODE_ENV
```

## 5. 私有包和组织

### 5.1 创建组织
```bash
npm org create my-org
```

### 5.2 管理访问权限
```bash
# 添加用户到组织
npm team add my-org:developers username

# 设置包访问权限
npm access public package-name
npm access restricted package-name
```

## 6. npm audit 和安全

### 6.1 安全审计
```bash
# 执行安全审计
npm audit

# 自动修复
npm audit fix

# 生成详细报告
npm audit --json
```

### 6.2 更新策略
```bash
# 检查更新
npm outdated

# 更新到最新版本
npm update

# 更新特定包
npm update package-name
```

## 7. 缓存管理

### 7.1 缓存命令
```bash
# 清理缓存
npm cache clean --force

# 验证缓存
npm cache verify

# 添加到缓存
npm cache add package-name
```

### 7.2 离线安装
```bash
# 从缓存安装
npm install --offline

# 优先使用缓存
npm install --prefer-offline
```

## 8. 发布策略

### 8.1 版本控制
```bash
# 预发布版本
npm version prerelease --preid=alpha

# 发布标签
npm publish --tag beta
```

### 8.2 发布配置
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/",
    "access": "public"
  }
}
```

## 9. Hook 脚本

### 9.1 package.json hooks
```json
{
  "scripts": {
    "prepare": "husky install",
    "prepublishOnly": "npm test && npm run lint",
    "preversion": "npm test",
    "version": "npm run build",
    "postversion": "git push && git push --tags"
  }
}
```

### 9.2 Git Hooks
```bash
# 使用 husky 配置 Git hooks
npx husky add .husky/pre-commit "npm test"
```

## 10. 调试技巧

### 10.1 日志级别
```bash
# 显示详细日志
npm install --loglevel verbose

# 显示调试信息
npm install --loglevel silly
```

### 10.2 性能分析
```bash
# 显示安装时间
npm install --timing

# 生成性能报告
npm install --timing --loglevel verbose > npm-debug.log
```

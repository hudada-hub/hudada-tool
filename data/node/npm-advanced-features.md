# NPM 高级特性

## 1. NPM 脚本

### 基本用法
```json
{
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack",
    "dev": "nodemon index.js"
  }
}
```

### 脚本钩子
- pre和post钩子
- 例如: preinstall, postinstall
```json
{
  "scripts": {
    "preinstall": "echo '安装前执行'",
    "install": "echo '安装中'",
    "postinstall": "echo '安装后执行'"
  }
}
```

## 2. NPM 工作空间 (Workspaces)

用于管理多包项目（monorepo）：
```json
{
  "name": "root-project",
  "workspaces": [
    "packages/*"
  ]
}
```

## 3. NPM 配置管理

### .npmrc 文件
```ini
registry=https://registry.npmmirror.com/
save-exact=true
package-lock=false
```

### 环境变量
- 通过 .env 文件管理环境变量
- 使用 cross-env 跨平台设置环境变量

## 4. 依赖管理高级技巧

### 版本锁定
- package-lock.json 的重要性
- npm shrinkwrap 命令

### 依赖版本范围
```json
{
  "dependencies": {
    "exact": "1.0.0",        // 精确版本
    "patch": "~1.0.0",       // 补丁版本更新
    "minor": "^1.0.0",       // 次要版本更新
    "latest": "*",           // 最新版本
    "git": "git+https://github.com/user/project.git",
    "local": "file:../local-package"
  }
}
```

## 5. NPM 缓存管理

常用命令：
```bash
# 查看缓存目录
npm config get cache

# 清除缓存
npm cache clean --force

# 验证缓存
npm cache verify
```

## 6. NPM 审计和安全

```bash
# 执行安全审计
npm audit

# 自动修复
npm audit fix

# 生成详细报告
npm audit --json
```

## 7. 发布包

### 发布流程
1. 注册 npm 账号
2. 登录: `npm login`
3. 发布: `npm publish`

### 版本管理
```bash
npm version patch  # 补丁版本 +1
npm version minor  # 次要版本 +1
npm version major  # 主要版本 +1
```

## 8. 私有 Registry

### 配置私有 registry
```bash
# 设置 registry
npm config set registry http://your-private-registry.com

# 设置 scope registry
npm config set @your-scope:registry http://your-private-registry.com
```

## 9. NPM CI vs NPM Install

- `npm ci`: 用于 CI/CD 环境，严格按照 package-lock.json 安装
- 特点：
  - 更快的安装速度
  - 确保可重现的构建
  - 自动删除 node_modules

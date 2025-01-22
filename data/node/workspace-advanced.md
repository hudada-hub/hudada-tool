# NPM 工作区高级配置指南

## 1. 高级工作区配置

### 1.1 嵌套工作区
```json
{
  "workspaces": [
    "packages/*",
    "apps/*",
    "tools/*/package",
    "!packages/private-*"  // 排除私有包
  ]
}
```

### 1.2 工作区协议
```json
{
  "dependencies": {
    "pkg1": "workspace:*",        // 使用工作区中的最新版本
    "pkg2": "workspace:^1.0.0",   // 遵循语义化版本
    "pkg3": "workspace:~1.0.0"    // 仅补丁版本更新
  }
}
```

## 2. 工作区脚本策略

### 2.1 过滤执行
```json
{
  "scripts": {
    "build": "npm run build --workspace=pkg1 --workspace=pkg2",
    "test:core": "npm run test --workspace=./packages/core",
    "lint:changed": "npm run lint --workspaces --if-present",
    "dev:exclude-docs": "npm run dev --workspaces --ignore @workspace/docs"
  }
}
```

### 2.2 并行执行优化
```json
{
  "scripts": {
    "build:parallel": "npm run build --workspaces --parallel",
    "test:parallel": "npm run test --workspaces --parallel --max-parallel=3"
  }
}
```

## 3. 依赖管理策略

### 3.1 共享配置
```json
{
  "workspaces": ["packages/*"],
  "dependencies": {
    "shared-lib": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^4.5.0",
    "jest": "^27.0.0"
  }
}
```

### 3.2 版本同步
```json
{
  "scripts": {
    "version": "npm version patch --workspaces",
    "publish": "npm publish --workspaces"
  }
}
```

## 4. 工作区引用

### 4.1 内部依赖
```json
// packages/app/package.json
{
  "dependencies": {
    "@workspace/ui": "workspace:^1.0.0",
    "@workspace/utils": "workspace:*"
  }
}
```

### 4.2 开发依赖共享
```json
// 根 package.json
{
  "devDependencies": {
    "typescript": "^4.5.0",
    "eslint": "^8.0.0"
  }
}
```

## 5. 发布配置

### 5.1 选择性发布
```json
{
  "workspaces": ["packages/*"],
  "private": true,
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 5.2 版本控制
```json
{
  "scripts": {
    "preversion": "npm test --workspaces",
    "version": "npm run build --workspaces && git add -A",
    "postversion": "git push && git push --tags"
  }
}
```

## 6. 工作区钩子

### 6.1 生命周期脚本
```json
{
  "scripts": {
    "preinstall": "node ./scripts/check-yarn.js",
    "postinstall": "npm run build --workspaces",
    "prepare": "husky install"
  }
}
```

### 6.2 条件脚本
```json
{
  "scripts": {
    "build:if-changed": "node scripts/build-changed-packages.js",
    "test:affected": "node scripts/test-affected-packages.js"
  }
}
```

## 7. 工作区约束

### 7.1 包命名约定
```json
// packages/*/package.json
{
  "name": "@organization/package-name",
  "version": "1.0.0"
}
```

### 7.2 依赖约束
```json
// package.json
{
  "engines": {
    "node": ">=14",
    "npm": ">=7"
  },
  "overrides": {
    "typescript": "^4.5.0"
  }
}
```

## 8. 调试技巧

### 8.1 日志级别
```bash
# 显示详细日志
npm install --workspace=pkg1 --loglevel verbose

# 显示调试信息
npm run build --workspaces --loglevel silly
```

### 8.2 依赖分析
```bash
# 查看工作区依赖图
npm ls --workspaces

# 检查特定工作区
npm ls --workspace=pkg1
```

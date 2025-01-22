# NPM 依赖管理高级技巧

## 1. 语义化版本（Semantic Versioning）

### 版本号格式
- 主版本号.次版本号.修订号（Major.Minor.Patch）
- 例如：`2.4.1`

### 版本范围表示法
```json
{
  "dependencies": {
    "package1": "1.0.0",    // 精确版本
    "package2": "~1.2.3",   // 允许修订号更新（1.2.3 到 1.2.9）
    "package3": "^1.2.3",   // 允许次版本和修订号更新（1.2.3 到 1.9.9）
    "package4": "*",        // 最新版本
    "package5": ">=1.2.3",  // 大于等于指定版本
    "package6": "1.2.x",    // x 位置任意值
    "package7": "1.x.x"     // 同 ^1.0.0
  }
}
```

## 2. 依赖类型

### dependencies
- 项目运行时必需的依赖
```json
{
  "dependencies": {
    "express": "^4.17.1",
    "react": "^17.0.2"
  }
}
```

### devDependencies
- 仅开发时需要的依赖
```json
{
  "devDependencies": {
    "jest": "^27.0.6",
    "eslint": "^7.32.0"
  }
}
```

### peerDependencies
- 插件对宿主包的依赖声明
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### optionalDependencies
- 可选依赖，安装失败不影响整体
```json
{
  "optionalDependencies": {
    "image-optimizer": "^1.0.0"
  }
}
```

## 3. 依赖锁定策略

### package-lock.json
- 锁定依赖树的具体版本
- 确保团队成员使用相同版本
- 加快安装速度

### npm-shrinkwrap.json
- 类似 package-lock.json
- 会被发布到 npm 仓库
- 适用于需要发布的库

## 4. 依赖更新策略

### 检查更新
```bash
# 检查过期依赖
npm outdated

# 查看依赖详情
npm ls

# 查看特定包的版本
npm view [package] versions
```

### 更新依赖
```bash
# 更新到最新版本
npm update

# 更新特定包
npm update [package]

# 更新到指定版本
npm install [package]@[version]
```

## 5. 依赖源管理

### 使用私有源
```bash
# 设置源
npm config set registry https://your-private-registry.com

# 使用 nrm 管理多个源
npm install -g nrm
nrm ls
nrm use taobao
```

### scope 源设置
```bash
npm config set @your-scope:registry https://your-registry.com
```

## 6. 依赖安全

### 安全审计
```bash
# 执行审计
npm audit

# 修复安全问题
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force
```

## 7. 依赖清理

```bash
# 清理未使用的依赖
npm prune

# 删除 node_modules
rm -rf node_modules
npm install

# 清理缓存
npm cache clean --force
```

## 8. 最佳实践

1. 版本锁定
- 使用 package-lock.json
- 重要依赖使用确切版本号

2. 依赖分类
- 正确使用不同类型的依赖声明
- 避免将开发依赖放入 dependencies

3. 定期更新
- 定期检查和更新依赖
- 关注安全公告

4. 依赖审查
- 安装前检查包的大小和依赖树
- 使用 `npm why` 检查依赖原因

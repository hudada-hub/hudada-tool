# 幽灵依赖与 PNPM 的严格依赖管理

## 1. 什么是幽灵依赖？

### 1.1 定义
幽灵依赖（Phantom Dependencies）是指项目中使用了但未在 package.json 中声明的依赖。这种情况在 npm 和 yarn 中很常见，因为它们使用扁平化的 node_modules 结构。

### 1.2 npm/yarn 的问题
```
node_modules/
├── express/
├── body-parser/      # express 的依赖
└── package.json      # 只声明了 express
```

在这种情况下，即使 package.json 中只声明了 express，你也可以：
```javascript
const bodyParser = require('body-parser'); // 能工作，但这是幽灵依赖！
```

## 2. PNPM 如何解决幽灵依赖

### 2.1 严格的依赖树结构
```
node_modules/
├── .pnpm/
│   ├── express@4.18.2/
│   │   └── node_modules/
│   │       ├── express/
│   │       └── body-parser/
│   └── body-parser@1.20.2/
│       └── node_modules/
│           └── body-parser/
└── express -> .pnpm/express@4.18.2/node_modules/express
```

### 2.2 实际演示
让我们创建一个示例来展示这个区别：

```javascript
// index.js
const _ = require('lodash');     // 在 package.json 中声明了
const moment = require('moment'); // 未在 package.json 中声明

console.log(_.VERSION);
console.log(moment().format());   // 在 pnpm 中会报错！
```

## 3. 依赖管理最佳实践

### 3.1 显式声明所有依赖
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2"  // 明确声明需要的依赖
  }
}
```

### 3.2 使用 pnpm 的严格模式
在 .npmrc 中：
```ini
shamefully-hoist=false    # 禁用依赖提升
strict-peer-dependencies=true
auto-install-peers=false
```

## 4. PNPM 的依赖管理特性

### 4.1 符号链接结构
- 只有直接依赖可以访问
- 间接依赖需要明确声明
- 防止意外使用未声明的包

### 4.2 依赖分析
```bash
# 查看依赖关系
pnpm why package-name

# 列出所有依赖
pnpm list

# 检查问题依赖
pnpm audit
```

## 5. 常见问题与解决方案

### 5.1 依赖访问问题
```javascript
// ❌ 错误方式：使用未声明的依赖
const undeclared = require('undeclared-package');

// ✅ 正确方式：先在 package.json 中声明
// pnpm add undeclared-package
const declared = require('declared-package');
```

### 5.2 迁移现有项目
1. 检查实际使用的依赖：
```bash
# 使用依赖检查工具
pnpm add -D dependency-cruiser
pnpm depcruise src
```

2. 更新 package.json：
```bash
# 添加缺失的依赖
pnpm add missing-package

# 移除未使用的依赖
pnpm remove unused-package
```

## 6. 依赖管理工具

### 6.1 依赖检查
```bash
# 检查过期依赖
pnpm outdated

# 检查重复依赖
pnpm dedupe

# 验证依赖树
pnpm verify-store
```

### 6.2 依赖更新
```bash
# 更新单个依赖
pnpm update package-name

# 交互式更新
pnpm update -i

# 更新到最新版本
pnpm update --latest
```

## 7. 最佳实践建议

1. **始终显式声明依赖**
   - 在 package.json 中列出所有直接使用的包
   - 使用 devDependencies 声明开发依赖

2. **定期维护依赖**
   - 检查并更新过期依赖
   - 移除未使用的依赖
   - 审计安全问题

3. **使用锁文件**
   - 保持 pnpm-lock.yaml 在版本控制中
   - 团队成员使用相同的依赖版本

4. **依赖分类**
   - dependencies: 运行时必需的依赖
   - devDependencies: 开发时的依赖
   - peerDependencies: 插件的宿主依赖

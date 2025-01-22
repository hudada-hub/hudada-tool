# PNPM 学习指南

## 1. PNPM 简介

PNPM (Performance NPM) 是一个快速、高效的包管理器，具有以下特点：
- 节省磁盘空间（通过硬链接共享依赖）
- 创建非扁平的 node_modules 目录
- 安装速度快
- 支持 monorepo

## 2. 安装 PNPM

```bash
# 使用 npm 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

## 3. 基本使用

### 3.1 创建新项目
```bash
# 创建项目目录
mkdir pnpm-demo
cd pnpm-demo

# 初始化项目
pnpm init
```

### 3.2 安装依赖
```bash
# 安装依赖
pnpm add [package]

# 安装开发依赖
pnpm add -D [package]

# 全局安装
pnpm add -g [package]

# 使用特定版本
pnpm add [package]@[version]
```

### 3.3 移除依赖
```bash
# 移除依赖
pnpm remove [package]

# 移除开发依赖
pnpm remove -D [package]

# 移除全局包
pnpm remove -g [package]
```

### 3.4 更新依赖
```bash
# 更新所有依赖
pnpm update

# 更新特定依赖
pnpm update [package]

# 交互式更新
pnpm update -i
```

## 4. PNPM 的特殊功能

### 4.1 内容寻址存储
PNPM 使用内容寻址存储来节省磁盘空间。所有文件都存储在全局 store 中，并通过硬链接在项目间共享。

### 4.2 严格的依赖管理
- 只能访问 package.json 中声明的依赖
- 防止依赖提升导致的问题

### 4.3 Workspace 支持
```bash
# workspace 配置 (pnpm-workspace.yaml)
packages:
  - 'packages/*'
  - 'components/*'
```

## 5. 实践项目

让我们创建一个简单的项目来实践 PNPM：

1. 创建项目结构：
```bash
mkdir pnpm-demo
cd pnpm-demo
pnpm init
```

2. 添加一些依赖：
```bash
pnpm add express
pnpm add -D typescript @types/express
```

3. 创建基本的 TypeScript 配置：
```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 6. 常见问题解决

### 6.1 依赖安装失败
```bash
# 清除缓存
pnpm store prune

# 重新安装
pnpm install --force
```

### 6.2 迁移已有项目
```bash
# 删除现有的 node_modules 和 lock 文件
rm -rf node_modules
rm package-lock.json
rm yarn.lock

# 使用 pnpm 安装依赖
pnpm install
```

## 7. 最佳实践

1. 使用 `.npmrc` 配置：
```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

2. 使用 `pnpm why` 查看依赖关系
3. 定期运行 `pnpm store prune` 清理未使用的包
4. 使用 `pnpm audit` 检查安全问题

## 后续步骤

1. 创建一个实际的项目
2. 尝试使用 workspace 功能
3. 探索更多高级特性

您想从哪个部分开始实践？我们可以一步步来操作。

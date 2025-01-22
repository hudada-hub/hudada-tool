# PNPM Workspace 指南

## 1. Workspace 概述

Workspace（工作空间）是 pnpm 的一个强大特性，允许你在一个仓库中管理多个相关的包。这对于 monorepo 项目特别有用。

### 1.1 目录结构
```
workspace-demo/
├── pnpm-workspace.yaml    # workspace 配置文件
├── package.json          # 根目录 package.json
├── packages/            # 共享包目录
│   └── ui/             # UI 组件库
│       ├── package.json
│       └── src/
│           ├── Button.tsx
│           └── index.ts
└── apps/               # 应用目录
    ├── web/           # Web 应用
    │   ├── package.json
    │   └── src/
    │       └── App.tsx
    └── admin/         # 管理后台
        ├── package.json
        └── src/
            └── App.tsx
```

## 2. Workspace 命令

### 2.1 基本命令
```bash
# 在所有包中运行命令
pnpm -r run build

# 在特定包中运行命令
pnpm --filter @workspace-demo/web run dev

# 并行执行命令
pnpm -r --parallel run dev

# 按顺序执行命令
pnpm -r run build
```

### 2.2 依赖管理
```bash
# 为特定包添加依赖
pnpm --filter @workspace-demo/web add lodash

# 为所有包添加开发依赖
pnpm -r add -D typescript

# 添加工作空间包作为依赖
pnpm add @workspace-demo/ui --filter @workspace-demo/web
```

## 3. Workspace 协议

### 3.1 workspace 协议
在 package.json 中使用 workspace: 协议引用本地包：
```json
{
  "dependencies": {
    "@workspace-demo/ui": "workspace:*"
  }
}
```

### 3.2 版本控制
```json
{
  "dependencies": {
    "@workspace-demo/ui": "workspace:^1.0.0"  // 特定版本
  }
}
```

## 4. 常见使用场景

### 4.1 共享配置
在根目录创建共享配置：
```json
{
  "name": "workspace-root",
  "devDependencies": {
    "typescript": "^5.3.2",
    "eslint": "^8.54.0"
  }
}
```

### 4.2 包之间的依赖
- 使用 workspace: 协议
- 自动链接本地依赖
- 确保版本一致性

## 5. 最佳实践

1. **合理组织目录结构**
   - packages/: 共享包
   - apps/: 应用
   - tools/: 工具和脚本

2. **版本管理**
   - 使用 workspace:* 保持最新版本
   - 或使用具体版本号确保稳定性

3. **脚本复用**
   - 在根目录定义通用脚本
   - 在各包中定义特定脚本

4. **依赖管理**
   - 共享依赖放在根目录
   - 特定依赖放在各包中

## 6. 常见问题解决

### 6.1 依赖问题
```bash
# 检查依赖关系
pnpm why package-name

# 重新安装所有依赖
pnpm install -w
```

### 6.2 构建顺序
```bash
# 按依赖顺序构建
pnpm -r build

# 强制按特定顺序构建
pnpm --filter "@workspace-demo/ui" build && pnpm --filter "@workspace-demo/web" build
```

## 7. CI/CD 集成

### 7.1 构建缓存
```yaml
# GitHub Actions 示例
steps:
  - uses: actions/cache@v3
    with:
      path: |
        **/node_modules
        ~/.pnpm-store
      key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 7.2 并行构建
```bash
# CI 环境中并行构建
pnpm -r --parallel --no-bail build
```

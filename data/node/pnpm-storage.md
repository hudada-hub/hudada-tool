# PNPM 高效存储机制详解

## 1. 内容寻址存储

### 1.1 概念
PNPM 使用基于内容寻址的存储方式，所有的包都存储在一个集中的位置（通常是 `~/.pnpm-store`）。每个文件通过其内容的哈希值来标识和存储。

### 1.2 查看存储位置
```bash
# 查看 store 位置
pnpm store path

# 查看 store 状态
pnpm store status
```

### 1.3 存储结构
```
~/.pnpm-store/v3
├── files/                # 实际文件内容
│   ├── xx-hash1         # 文件1的内容
│   └── xx-hash2         # 文件2的内容
└── metadata.json        # 元数据信息
```

## 2. 硬链接机制

### 2.1 工作原理
当多个项目使用相同版本的包时，PNPM 不会复制这些文件，而是创建硬链接指向全局 store 中的文件。

### 2.2 node_modules 结构
```
node_modules
├── .pnpm               # 所有依赖的实际位置
│   ├── react@18.2.0
│   │   └── node_modules
│   │       └── react   # 硬链接到 store
│   └── lodash@4.17.21
│       └── node_modules
│           └── lodash  # 硬链接到 store
├── react              # 符号链接到 .pnpm/react@18.2.0/node_modules/react
└── lodash             # 符号链接到 .pnpm/lodash@4.17.21/node_modules/lodash
```

## 3. 实际演示

### 3.1 创建测试项目
让我们创建两个使用相同依赖的项目来演示存储机制：

```bash
# 项目1
mkdir project1
cd project1
pnpm init
pnpm add lodash

# 项目2
cd ..
mkdir project2
cd project2
pnpm init
pnpm add lodash
```

### 3.2 验证硬链接
```bash
# Windows
fsutil hardlink list "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/package.json"

# Linux/Mac
ls -i "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/package.json"
```

## 4. 存储管理命令

### 4.1 基本命令
```bash
# 清理未使用的包
pnpm store prune

# 验证 store 完整性
pnpm store verify

# 添加新的 store
pnpm store add <package>

# 状态检查
pnpm store status
```

### 4.2 离线模式
```bash
# 仅使用缓存安装
pnpm install --offline

# 优先使用缓存
pnpm install --prefer-offline
```

## 5. 存储优化

### 5.1 配置选项
在 `.npmrc` 文件中：
```ini
# 自定义 store 目录
store-dir=./.pnpm-store

# 启用/禁用硬链接
node-linker=hoisted

# 共享依赖的范围
shared-workspace-lockfile=false
```

### 5.2 存储清理
定期维护存储以优化空间：
```bash
# 清理未使用的包
pnpm store prune

# 完全清理 store
pnpm store clear
```

## 6. 性能对比

### 6.1 磁盘空间节省
假设有 10 个项目都使用 React 18.2.0：
- npm/yarn: 10 × ~5MB = ~50MB
- pnpm: 1 × ~5MB = ~5MB

### 6.2 安装速度
由于使用硬链接，pnpm 的安装速度通常比 npm/yarn 快：
- 首次安装：与 npm/yarn 相似
- 后续安装：显著更快（因为可以直接使用已有的硬链接）

## 7. 最佳实践

1. **定期维护**
   ```bash
   # 每月运行一次
   pnpm store prune
   pnpm store verify
   ```

2. **CI/CD 优化**
   ```bash
   # 使用 store 缓存
   - uses: actions/cache@v3
     with:
       path: ~/.pnpm-store
       key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

3. **多项目管理**
   - 使用共享的全局 store
   - 利用 workspace 功能管理相关项目

## 8. 故障排除

### 8.1 常见问题
1. 硬链接创建失败
   ```bash
   # 重新创建 node_modules
   rm -rf node_modules
   pnpm install --force
   ```

2. store 损坏
   ```bash
   # 验证并修复 store
   pnpm store verify
   pnpm store prune
   ```

### 8.2 性能问题
1. 存储位置
   - 将 store 放在 SSD 上
   - 避免网络存储位置

2. 权限问题
   - 确保有足够的文件系统权限
   - 检查 store 目录的访问权限

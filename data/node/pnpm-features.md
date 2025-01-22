# PNPM 高级特性详解

## 1. 节省磁盘空间的存储机制

### 1.1 内容寻址存储
```bash
# pnpm 将所有包存储在一个集中的位置（通常在 ~/.pnpm-store）
~/.pnpm-store/v3
  └── files
      └── xx-hash-of-file-content
```

### 1.2 硬链接机制
- 不同项目使用相同版本的包时，不会重复占用磁盘空间
- 每个项目的 node_modules 中的文件都是硬链接到全局 store

### 1.3 查看存储信息
```bash
# 查看 store 路径
pnpm store path

# 查看 store 状态
pnpm store status

# 清理未使用的包
pnpm store prune
```

## 2. 严格的依赖管理

### 2.1 非扁平的 node_modules 结构
```
node_modules
├── .pnpm
│   ├── react@18.2.0
│   │   └── node_modules
│   │       ├── react
│   │       └── loose-envify
│   └── express@4.18.2
│       └── node_modules
│           ├── express
│           └── body-parser
└── package.json
```

### 2.2 依赖隔离
- 只能访问 package.json 中声明的依赖
- 防止幽灵依赖（避免使用未声明的依赖）

## 3. Workspace 特性

### 3.1 创建 Workspace
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'components/*'
```

### 3.2 Workspace 命令
```bash
# 在所有包中运行命令
pnpm -r test

# 在特定包中运行命令
pnpm --filter package-name test

# 并行执行命令
pnpm -r --parallel test
```

## 4. 依赖过滤和管理

### 4.1 依赖过滤
```bash
# 安装生产依赖
pnpm add package-name --save-prod

# 安装开发依赖
pnpm add package-name --save-dev

# 安装可选依赖
pnpm add package-name --save-optional
```

### 4.2 依赖更新策略
```bash
# 交互式更新
pnpm update -i

# 更新到最新版本
pnpm update --latest

# 更新到指定范围内的最新版本
pnpm update --interactive
```

## 5. 性能优化特性

### 5.1 并行安装
- 默认并行下载和安装依赖
- 可配置并行度：
```ini
# .npmrc
network-concurrency=10
```

### 5.2 缓存优化
```bash
# 清除缓存
pnpm store prune

# 验证缓存
pnpm store verify

# 只从缓存安装
pnpm install --offline
```

## 6. 高级配置

### 6.1 .npmrc 配置
```ini
# 项目级配置
node-linker=hoisted
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true

# 限制包管理器
engine-strict=true
```

### 6.2 环境变量
```bash
# 设置 store 目录
PNPM_HOME=/custom/path pnpm install

# 设置离线模式
PNPM_OFFLINE=1 pnpm install
```

## 7. CI/CD 集成

### 7.1 CI 环境优化
```bash
# 使用 frozen-lockfile
pnpm install --frozen-lockfile

# 使用 prefer-offline
pnpm install --prefer-offline
```

### 7.2 构建缓存
```yaml
# GitHub Actions 示例
steps:
  - uses: actions/checkout@v3
  - uses: pnpm/action-setup@v2
    with:
      version: 8
  - name: Get pnpm store directory
    shell: bash
    run: |
      echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_ENV
  - uses: actions/cache@v3
    with:
      path: ${{ env.STORE_PATH }}
      key: pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## 8. 最佳实践

1. **使用 pnpm-lock.yaml**
   - 确保依赖版本一致性
   - 提高安装速度

2. **定期维护**
   ```bash
   # 检查过期依赖
   pnpm outdated
   
   # 清理未使用的包
   pnpm store prune
   ```

3. **使用 workspace 管理大型项目**
   - 统一管理多个包
   - 共享配置和依赖

4. **依赖审计**
   ```bash
   # 安全审计
   pnpm audit
   
   # 修复安全问题
   pnpm audit fix
   ```

## 9. 故障排除

1. **依赖冲突**
   ```bash
   # 查看依赖树
   pnpm why package-name
   
   # 强制重新安装
   pnpm install --force
   ```

2. **性能问题**
   ```bash
   # 使用 --timing 查看安装时间
   pnpm install --timing
   
   # 清理缓存后重新安装
   pnpm store prune && pnpm install
   ```

# package-lock.json 详解

## 1. 基本概念

`package-lock.json` 是 npm 5.0 版本后引入的一个锁定文件，用于锁定项目依赖的具体版本和依赖树结构。

### 1.1 主要作用
- 锁定依赖版本，确保团队开发环境一致
- 加快项目依赖安装速度
- 提供项目依赖的完整快照

## 2. 文件结构解析

```json
{
  "name": "项目名称",
  "version": "项目版本",
  "lockfileVersion": 锁文件版本,
  "requires": true,
  "packages": {
    "": {
      "name": "项目名称",
      "version": "项目版本",
      "dependencies": {},
      "devDependencies": {}
    },
    "node_modules/包名": {
      "version": "具体版本号",
      "resolved": "包的下载地址",
      "integrity": "包的完整性校验值",
      "requires": {
        "依赖包": "版本要求"
      },
      "dependencies": {
        "子依赖": "版本信息"
      }
    }
  }
}
```

## 3. 重要字段说明

### 3.1 version
- 记录当前安装的确切版本
- 不同于 package.json 中的版本范围
- 确保所有环境使用相同版本

### 3.2 resolved
- 包的下载地址
- 通常是 npm registry 的地址
- 保证包来源的一致性

### 3.3 integrity
- 包的 SHA512 哈希值
- 用于验证包的完整性
- 防止包被篡改

### 3.4 requires
- 声明包的依赖要求
- 与 package.json 中的依赖对应
- 包含版本约束信息

### 3.5 dependencies
- 记录子依赖关系
- 构建完整的依赖树
- 处理依赖冲突

## 4. 版本锁定机制

### 4.1 精确版本
```json
"lodash": {
  "version": "4.17.21"
}
```

### 4.2 依赖树展平
```
项目
└── node_modules
    ├── A@1.0.0
    └── B@2.0.0
        └── A@1.1.0
```

## 5. 使用场景

### 5.1 团队协作
- 确保团队成员使用相同的依赖版本
- 避免"在我电脑上能运行"的问题
- 提高项目的可复制性

### 5.2 CI/CD
- 保证构建环境的一致性
- 加快构建速度
- 提高部署的可靠性

### 5.3 版本控制
- 应该提交到版本控制系统
- 与 package.json 一起使用
- 记录依赖的变更历史

## 6. 最佳实践

### 6.1 版本控制
- 将 package-lock.json 纳入版本控制
- 不要手动修改该文件
- 使用 npm 命令管理依赖

### 6.2 依赖安装
- 优先使用 `npm ci` 而不是 `npm install`
- `npm ci` 严格按照 package-lock.json 安装
- 更快、更可靠的安装过程

### 6.3 更新依赖
- 使用 `npm update` 更新依赖
- 检查更新后的 package-lock.json
- 及时提交变更

## 7. 常见问题处理

### 7.1 版本冲突
- 检查依赖树 `npm ls`
- 使用 `npm dedupe` 消除重复
- 必要时手动解决冲突

### 7.2 文件损坏
- 删除 package-lock.json
- 删除 node_modules
- 重新运行 `npm install`

### 7.3 git 合并冲突
- 优先保留 master 分支的版本
- 重新运行 `npm install`
- 验证依赖是否正确

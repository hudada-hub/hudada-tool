# NPM 包发布完整指南

## 1. 准备工作

### 1.1 注册 npm 账号
```bash
# 方式1：网站注册
访问 https://www.npmjs.com 注册账号

# 方式2：命令行注册
npm adduser
```

### 1.2 登录 npm
```bash
# 登录 npm 账号
npm login

# 验证登录状态
npm whoami
```

### 1.3 初始化项目
```bash
# 创建新项目
mkdir my-npm-package
cd my-npm-package

# 初始化 package.json
npm init
```

## 2. package.json 配置

### 2.1 必需字段
```json
{
  "name": "包名称",         // 必须唯一
  "version": "1.0.0",      // 语义化版本
  "main": "入口文件",       // 默认 index.js
  "description": "包描述",  // 包功能描述
  "author": "作者信息"      // 作者
}
```

### 2.2 重要可选字段
```json
{
  "keywords": ["关键词"],   // 便于搜索
  "license": "MIT",        // 开源协议
  "repository": {          // 代码仓库
    "type": "git",
    "url": "仓库地址"
  },
  "bugs": {               // 问题反馈
    "url": "问题反馈地址"
  },
  "homepage": "项目主页"
}
```

## 3. 项目结构

```
my-npm-package/
├── src/                  # 源代码目录
├── dist/                 # 编译后代码
├── test/                 # 测试文件
├── README.md            # 项目说明
├── package.json         # 包配置
├── .gitignore          # Git忽略文件
├── .npmignore          # npm忽略文件
└── LICENSE             # 开源协议
```

## 4. 发布流程

### 4.1 发布前检查
```bash
# 检查 package.json
- name 是否唯一（可在 npmjs.com 搜索）
- version 是否正确
- main 入口文件是否存在

# 检查 npm 源
npm config get registry
# 确保是 https://registry.npmjs.org/
```

### 4.2 发布命令
```bash
# 发布包
npm publish

# 发布公开的 scoped 包
npm publish --access public
```

### 4.3 版本管理
```bash
# 升级补丁版本 1.0.0 -> 1.0.1
npm version patch

# 升级小版本 1.0.0 -> 1.1.0
npm version minor

# 升级大版本 1.0.0 -> 2.0.0
npm version major
```

## 5. 包管理

### 5.1 更新包
```bash
# 修改代码后更新版本
npm version patch
npm publish
```

### 5.2 删除版本
```bash
# 删除指定版本
npm unpublish 包名@版本号

# 删除整个包（慎用）
npm unpublish 包名 --force
```

### 5.3 废弃版本
```bash
# 废弃指定版本
npm deprecate 包名@版本号 "废弃原因"
```

## 6. 私有包

### 6.1 scoped 包
```bash
# package.json
{
  "name": "@组织名/包名"
}

# 发布
npm publish --access public
```

### 6.2 私有 registry
```bash
# 设置私有 registry
npm config set registry 私有registry地址

# 发布到私有 registry
npm publish
```

## 7. 最佳实践

### 7.1 发布前准备
- 完善文档（README.md）
- 添加测试用例
- 检查依赖项
- 确保代码质量

### 7.2 版本控制
- 遵循语义化版本
- 及时更新 CHANGELOG
- 标记 Git 版本

### 7.3 安全考虑
- 不要发布敏感信息
- 使用 .npmignore
- 控制包大小

## 8. 常见问题

### 8.1 发布失败
- 检查包名是否重复
- 确认 npm 源配置
- 验证登录状态
- 检查网络连接

### 8.2 版本冲突
- 确保版本号递增
- 检查是否有相同版本
- 使用 npm view 查看已发布版本

### 8.3 权限问题
- 确认账号权限
- 检查组织成员权限
- 私有包访问控制

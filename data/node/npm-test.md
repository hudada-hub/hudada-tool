# NPM Test 命令详解

`npm test` (或 `npm t`) 是 NPM 提供的标准测试命令，用于运行项目的测试脚本。

## 1. 基本用法

### 1.1 直接运行测试
```bash
npm test
# 或简写
npm t
```

### 1.2 传递额外参数
```bash
npm test -- --watch
npm test -- --coverage
```

## 2. 配置测试脚本

在 `package.json` 中配置：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:unit": "jest src/",
    "pretest": "npm run lint",
    "posttest": "npm run clean"
  }
}
```

## 3. 常用测试框架

### 3.1 Jest
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### 3.2 Mocha
```json
{
  "scripts": {
    "test": "mocha 'tests/**/*.js'",
    "test:watch": "mocha --watch 'tests/**/*.js'"
  },
  "devDependencies": {
    "mocha": "^10.0.0",
    "chai": "^4.0.0"
  }
}
```

### 3.3 Vitest
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^0.34.0"
  }
}
```

## 4. 测试生命周期钩子

```json
{
  "scripts": {
    "pretest": "npm run lint",      // 测试前运行
    "test": "jest",                 // 测试命令
    "posttest": "npm run clean"     // 测试后运行
  }
}
```

## 5. 高级用法

### 5.1 工作区测试
```bash
# 测试所有工作区
npm test --workspaces

# 测试特定工作区
npm test --workspace=package-name
```

### 5.2 并行测试
```json
{
  "scripts": {
    "test": "jest --maxWorkers=4",
    "test:parallel": "jest --parallel"
  }
}
```

### 5.3 选择性测试
```json
{
  "scripts": {
    "test:changed": "jest --onlyChanged",
    "test:related": "jest --findRelatedTests path/to/file.js",
    "test:pattern": "jest --testNamePattern='pattern'"
  }
}
```

## 6. 测试报告和覆盖率

### 6.1 覆盖率报告
```json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:coverage:html": "jest --coverage --coverageReporters='html'"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### 6.2 自定义报告
```json
{
  "scripts": {
    "test:ci": "jest --ci --reporters='jest-junit'",
    "test:report": "jest --json --outputFile=report.json"
  }
}
```

## 7. 最佳实践

1. **组织测试文件**
   ```
   src/
     ├── components/
     │   └── Button.js
     └── __tests__/
         └── Button.test.js
   ```

2. **设置测试环境**
   ```json
   {
     "jest": {
       "testEnvironment": "jsdom",
       "setupFilesAfterEnv": ["<rootDir>/setup-tests.js"]
     }
   }
   ```

3. **使用测试辅助工具**
   ```json
   {
     "devDependencies": {
       "@testing-library/react": "^13.0.0",
       "@testing-library/jest-dom": "^5.0.0",
       "@testing-library/user-event": "^14.0.0"
     }
   }
   ```

## 8. 常见问题解决

1. **超时问题**
   ```json
   {
     "jest": {
       "testTimeout": 10000
     }
   }
   ```

2. **内存问题**
   ```bash
   NODE_OPTIONS=--max_old_space_size=4096 npm test
   ```

3. **调试测试**
   ```json
   {
     "scripts": {
       "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
     }
   }
   ```

## 9. CI/CD 集成

```yaml
# GitHub Actions 示例
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

## 10. 注意事项

1. 保持测试独立性
2. 合理使用 mock
3. 维护测试代码质量
4. 定期更新测试依赖
5. 关注测试性能
6. 确保测试可重复性
7. 适当使用快照测试
8. 遵循测试金字塔原则
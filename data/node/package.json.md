main:一般常用入口文件
browser:浏览器环境下的入口
module:es模块下的入口
浏览器环境下权重->browser->module->main
node环境下权重->main最大，其他无效

exports字段：版本14.13以后才有用
里面有：
```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/node/index.d.ts",
        "default": "./dist/node/index.js"
      },
      "require": {
        "types": "./index.d.cts",
        "default": "./index.cjs"
      }
    },
    "./runtime": {
      "types": "./dist/node/runtime.d.ts",
      "import": "./dist/node/runtime.js"
    },
  }
}
```
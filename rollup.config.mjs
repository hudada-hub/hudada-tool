import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
export default [
  {
    input: 'src/ssh/client/index.ts',
    output: {
        dir: 'dist/ssh/client',  // 修改输出目录
        format: 'es',
        entryFileNames: 'index.js',  // 简化输出文件名
        chunkFileNames: 'chunks/[name]-[hash].js',  // 将 chunks 放在子目录
    },
    plugins: [
      postcss({  // 添加 CSS 处理插件
        extract: true,  // 提取到单独的文件
        minimize: true, // 压缩 CSS
        modules: false  // 如果需要 CSS 模块化，设为 true
    }),
      typescript({
        tsconfig: './tsconfig.json',  // 使用 tsconfig
        compilerOptions: {
            outDir: 'dist/ssh/client',
            target: 'es2020',
            module: 'esnext',
            moduleResolution: 'node',
            lib: ['dom', 'dom.iterable', 'esnext'],
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: false
        }
    }),
        nodeResolve({
            browser: true,
            preferBuiltins: false , // 浏览器环境不使用 Node.js 内置模块
            extensions: ['.ts', '.js']
        }),
        commonjs({
            transformMixedEsModules: true  // 处理混合模块
        }),
        json(),

        copy({
            targets: [
                {
                    src: 'src/ssh/client/index.html',
                    dest: 'dist/ssh/client'
                }
            ],
            hook: 'writeBundle'  // 在 bundle 写入后复制文件
        })
    ],

},
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      banner: '#!/usr/bin/env node',
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
      // paths: {
      //     'commander': 'commander/esm.mjs',
      //     'chalk': 'chalk/source/index.mjs',
      //     'marked': 'marked/lib/marked.esm.mjs',
      //     'marked-terminal': 'marked-terminal/index.mjs',
      //     'open': 'open/index.mjs',
      //   }
    },
    external: [
      // Node native modules
      'crypto',
      'events',
      'fs',
      'path',
      'stream',
      'util',
      // Native addons and problematic modules
      /\.node$/,
      'cpu-features',
      'ssh2',
      'cli-highlight',
      'socket.io',
      "openai",
      'socket.io-client',
      'xterm',
      'xterm-addon-fit',
      'chalk',
      'open',
        '@imgly/background-removal-node',
        'sharp'
    ],
    plugins: [
      json(),
      resolve({
        preferBuiltins: true,
        exportConditions: ['node', 'import', 'default','require'],
        extensions: ['.ts', '.js', '.mjs', '.json', '.node','.cjs']
      }),

      commonjs({
        extensions: ['.js', '.ts','.cjs'],
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto',
        esmExternals: true,
        ignoreDynamicRequires: true,
        // 特别处理 ws 模块
        ignore: ['bufferutil', 'utf-8-validate']
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
      }),
      terser({
        format: {
          comments: false,
        }
      }),
      copy({
        targets: [

          {
            src: 'src/template',
            dest: 'dist'
          },
          {
            src: 'src/comment',
            dest: 'dist'
          }
        ]
      })

    ]
  }
];
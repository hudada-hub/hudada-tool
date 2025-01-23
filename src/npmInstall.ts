import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export async function installDependencies(dirPath: string) {
    try {
        // 获取绝对路径
        const absolutePath = process.cwd();
        
        // 递归处理函数
        async function processDirectory(currentPath: string) {
            // 检查当前目录是否存在 package.json
            const packageJsonPath = path.join(currentPath, 'package.json');
            
            if (fs.existsSync(packageJsonPath)) {
                console.log(chalk.cyan(`\n在目录 ${currentPath} 中发现 package.json`));
                try {
                    // 执行 pnpm install
                    console.log(chalk.yellow('正在安装依赖...'));
                    execSync('pnpm install', { 
                        cwd: currentPath,
                        stdio: 'inherit'
                    });
                    console.log(chalk.green('依赖安装成功！'));
                } catch (error:any) {
                    console.error(chalk.red(`安装依赖失败: ${error.message}`));
                }
            }

            // 获取所有子目录
            const items = fs.readdirSync(currentPath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory() && item.name !== 'node_modules') {
                    const subPath = path.join(currentPath, item.name);
                    await processDirectory(subPath);
                }
            }
        }

        // 开始处理
        console.log(chalk.cyan(`开始检查目录: ${absolutePath}`));
        await processDirectory(absolutePath);
        console.log(chalk.green('\n所有目录处理完成！'));

    } catch (error) {
        console.error(chalk.red('执行过程中发生错误:'), error);
    }
}
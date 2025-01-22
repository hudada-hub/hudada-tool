import open, { openApp } from 'open';
import chalk from 'chalk';
import { join, resolve } from 'path';

export async function handleVSCode(args: string[]) {
    try {
        // 获取要打开的路径
        let targetPath: string;

        if (args.length > 0) {
            // 如果是 "." 则使用当前目录
            if (args[0] === '.') {
                targetPath = process.cwd();
            }
            // 如果是绝对路径（如 C:\path 或 /path）
            else if (isAbsolutePath(args[0])) {
                targetPath = args[0];
            }
            // 相对路径
            else {
                targetPath = join(process.cwd(), args[0]);
            }
        } else {
            // 默认使用当前目录
            targetPath = process.cwd();
        }

        // 解析为绝对路径
        const fullPath = resolve(targetPath);

        // 使用 open 打开 VS Code
        await openApp('code', {
            arguments: [fullPath]
        });

        console.log(chalk.green(`已在 VS Code 中打开: ${fullPath}`));
    } catch (error) {
        console.error(chalk.red('启动 VS Code 失败：'), error instanceof Error ? error.message : '未知错误');
        console.log(chalk.yellow('请确保 VS Code 已安装'));
    }
}

// 判断是否为绝对路径
function isAbsolutePath(path: string): boolean {
    // Windows 路径（如 C:\path）
    if (/^[A-Za-z]:\\/.test(path)) {
        return true;
    }
    // Unix 路径（如 /path）
    if (path.startsWith('/')) {
        return true;
    }
    return false;
}
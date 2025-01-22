import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export async function managePath(action?: string, targetPath?: string) {
    try {
        if (!action) {
            // 如果没有参数，显示当前 PATH
            await showCurrentPath();
            return;
        }

        switch (action.toLowerCase()) {
            case 'add':
                if (!targetPath) {
                    console.error(chalk.red('请提供要添加的路径'));
                    console.log(chalk.gray('用法: my path add <路径>'));
                    return;
                }
                await addToPath(targetPath);
                break;

            case 'remove':
                if (!targetPath) {
                    console.error(chalk.red('请提供要删除的路径'));
                    console.log(chalk.gray('用法: my path remove <路径>'));
                    return;
                }
                await removeFromPath(targetPath);
                break;

            case 'list':
                await showCurrentPath();
                break;

            default:
                console.error(chalk.red('无效的操作'));
                console.log(chalk.gray('支持的操作: add, remove, list'));
                break;
        }
    } catch (error) {
        console.error(chalk.red('操作失败:'), error);
    }
}

async function showCurrentPath() {
    try {
        // 获取当前 PATH
        const pathValue = process.env.PATH || '';
        const paths = pathValue.split(path.delimiter);

        console.log(chalk.cyan('\n当前系统 PATH:'));
        console.log(chalk.gray('总计: '), paths.length, '个路径\n');

        // 检查每个路径的状态
        for (let i = 0; i < paths.length; i++) {
            const p = paths[i];
            const exists = existsSync(p);
            const index = chalk.gray(`${(i + 1).toString().padStart(2, '0')}.`);

            console.log(
                index,
                exists ? chalk.green('✓') : chalk.red('✗'),
                exists ? p : chalk.dim(p),
                exists ? '' : chalk.red('(路径不存在)')
            );
        }

        console.log(); // 空行
    } catch (error) {
        console.error(chalk.red('获取 PATH 失败:'), error);
    }
}

async function addToPath(newPath: string) {
    try {
        // 转换为绝对路径
        const absolutePath = path.isAbsolute(newPath)
            ? newPath
            : path.resolve(process.cwd(), newPath);

        // 检查路径是否存在
        if (!existsSync(absolutePath)) {
            console.error(chalk.red('路径不存在:'), absolutePath);
            return;
        }

        // 获取当前 PATH
        const currentPath = process.env.PATH || '';


        const paths = currentPath.split(path.delimiter);

        // 检查路径是否已存在
        if (paths.includes(absolutePath)) {
            console.log(chalk.yellow('路径已存在于 PATH 中'));
            return;
        }

        // Windows 和 Unix 系统使用不同的命令
        if (process.platform === 'win32') {
            // console.log(23222,currentPath,'currentPath');

            // Windows
            const command = `setx PATH "%PATH%;${absolutePath};"`;
            console.log(command,'command');
            await execAsync(command);
        } else {
            // Unix
            const shellType = process.env.SHELL?.includes('zsh') ? 'zsh' : 'bash';
            const rcFile = shellType === 'zsh' ? '~/.zshrc' : '~/.bashrc';
            const command = `echo 'export PATH="$PATH:${absolutePath}"' >> ${rcFile}`;
            await execAsync(command);
        }

        console.log(chalk.green('✓ 成功添加路径到 PATH'));
        console.log(chalk.gray('新添加:'), absolutePath);
        console.log(chalk.gray('注意: 可能需要重新打开终端才能生效'));

    } catch (error) {
        console.error(chalk.red('添加路径失败:'), error);
    }
}

async function removeFromPath(targetPath: string) {
    try {
        // 转换为绝对路径
        const absolutePath = path.isAbsolute(targetPath)
            ? targetPath
            : path.resolve(process.cwd(), targetPath);

        // 获取当前 PATH
        const currentPath = process.env.PATH || '';
        const paths = currentPath.split(path.delimiter);

        // 检查路径是否存在于 PATH 中
        if (!paths.includes(absolutePath)) {
            console.log(chalk.yellow('路径不存在于 PATH 中'));
            return;
        }

        // 移除路径
        const newPaths = paths.filter(p => p !== absolutePath);
        const newPathString = newPaths.join(path.delimiter);

        if (process.platform === 'win32') {
            console.log(newPathString,'newPathString');

            // Windows
            const command = `setx PATH "${newPathString}"`;
            await execAsync(command);
        } else {
            // Unix
            const home = process.env.HOME;
            const shellType = process.env.SHELL?.includes('zsh') ? 'zsh' : 'bash';
            const rcFile = path.join(home!, shellType === 'zsh' ? '.zshrc' : '.bashrc');

            try {
                // 读取配置文件
                const content = await fs.readFile(rcFile, 'utf8');

                // 创建备份
                await fs.writeFile(`${rcFile}.backup`, content);

                // 处理每一行
                const lines = content.split('\n');
                const newLines = lines.filter(line => {
                    // 排除包含目标路径的 PATH 导出行
                    const isPathExport = line.includes('export PATH=') || line.includes('PATH=');
                    const containsTargetPath = line.includes(absolutePath);
                    return !(isPathExport && containsTargetPath);
                });

                // 写入新内容
                await fs.writeFile(rcFile, newLines.join('\n'));

                console.log(chalk.green('✓ 成功从 PATH 中移除路径'));
                console.log(chalk.gray('已移除:'), absolutePath);
                console.log(chalk.gray('配置文件已更新:'), rcFile);
                console.log(chalk.gray('备份文件已创建:'), `${rcFile}.backup`);
                console.log(chalk.gray('注意: 需要重新加载配置文件或重新打开终端才能生效'));
                console.log(chalk.gray('可以使用以下命令立即生效:'));
                console.log(chalk.gray(`  ${shellType === 'zsh' ? 'source ~/.zshrc' : 'source ~/.bashrc'}`));

            } catch (error) {
                console.error(chalk.red('更新配置文件失败:'), error);
                console.log(chalk.yellow('建议手动编辑配置文件删除相关路径'));
            }
        }

    } catch (error) {
        console.error(chalk.red('移除路径失败:'), error);
    }
}
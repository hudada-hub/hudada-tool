import fs from 'fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function copyFileOrDirectory(source: string, destination: string) {
    try {
        // 检查参数
        if (!source || !destination) {
            console.error(chalk.red('请提供源路径和目标路径'));
            console.log(chalk.gray('用法: my cp <源路径> <目标路径>'));
            return;
        }

        // 转换为绝对路径
        const sourcePath = path.isAbsolute(source)
            ? source
            : path.resolve(process.cwd(), source);
        const destPath = path.isAbsolute(destination)
            ? destination
            : path.resolve(process.cwd(), destination);

        // 检查源路径是否存在
        if (!existsSync(sourcePath)) {
            console.error(chalk.red(`源路径不存在: ${source}`));
            return;
        }

        // 获取源文件/目录信息
        const sourceStats = await fs.stat(sourcePath);
        const isDirectory = sourceStats.isDirectory();
        const type = isDirectory ? '目录' : '文件';

        // 显示操作信息
        console.log(chalk.cyan(`准备复制${type}:`));
        console.log(chalk.gray(`从: ${sourcePath}`));
        console.log(chalk.gray(`到: ${destPath}`));

        // 检查目标路径是否已存在
        if (existsSync(destPath)) {
            console.error(chalk.red(`目标路径已存在: ${destination}`));
            return;
        }

        try {
            if (isDirectory) {
                await copyDirectory(sourcePath, destPath);
            } else {
                await copyFile(sourcePath, destPath);
            }

            // 获取新的文件/目录信息
            const newStats = await fs.stat(destPath);

            console.log(chalk.green(`✓ 复制成功`));
            console.log(chalk.gray('详细信息:'));
            console.log(chalk.gray(`类型: ${type}`));
            console.log(chalk.gray(`大小: ${formatSize(newStats.size)}`));
            console.log(chalk.gray(`修改时间: ${formatDate(newStats.mtime)}`));

            if (isDirectory) {
                const items = await countItems(destPath);
                console.log(chalk.gray(`包含: ${items.files} 个文件, ${items.directories} 个目录`));
            }

        } catch (error: any) {
            if (error.code === 'EACCES') {
                throw new Error(`没有权限复制: ${source}`);
            } else if (error.code === 'ENOSPC') {
                throw new Error('磁盘空间不足');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error(chalk.red('复制失败:'), error);
    }
}

async function copyDirectory(src: string, dest: string) {
    // 创建目标目录
    await fs.mkdir(dest, { recursive: true });

    // 复制目录内容
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await copyFile(srcPath, destPath);
        }
    }
}

async function copyFile(src: string, dest: string) {
    // 确保目标目录存在
    await fs.mkdir(path.dirname(dest), { recursive: true });

    // 使用流复制大文件
    return new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(src);
        const writeStream = createWriteStream(dest);

        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);

        readStream.pipe(writeStream);
    });
}

async function countItems(dirPath: string): Promise<{ files: number; directories: number }> {
    let files = 0;
    let directories = 0;

    async function scan(currentPath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                directories++;
                await scan(fullPath);
            } else {
                files++;
            }
        }
    }

    await scan(dirPath);
    return { files, directories };
}

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(date: Date): string {
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
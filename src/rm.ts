import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { existsSync } from 'fs';

export async function removeFileOrDirectory(targetPath: string) {
    try {
        // 转换为绝对路径
        const absolutePath = path.isAbsolute(targetPath)
            ? targetPath
            : path.resolve(process.cwd(), targetPath);

        // 检查路径是否存在
        if (!existsSync(absolutePath)) {
            console.error(chalk.red(`路径不存在: ${targetPath}`));
            return;
        }

        // 获取文件/目录信息
        const stats = await fs.stat(absolutePath);
        const isDirectory = stats.isDirectory();
        const type = isDirectory ? '目录' : '文件';

        // 确认删除
        console.log(chalk.yellow(`即将删除${type}: ${targetPath}`));
        console.log(chalk.gray('类型:', type));
        console.log(chalk.gray('大小:', formatSize(await calculateSize(absolutePath))));
        console.log(chalk.gray('修改时间:', formatDate(stats.mtime)));

        if (isDirectory) {
            const items = await countItems(absolutePath);
            console.log(chalk.gray(`包含: ${items.files} 个文件, ${items.directories} 个目录`));
        }

        // 执行删除
        try {
            if (isDirectory) {
                await fs.rm(absolutePath, { recursive: true, force: true });
            } else {
                await fs.unlink(absolutePath);
            }
            console.log(chalk.green(`✓ 成功删除${type}: ${targetPath}`));
        } catch (error: any) {
            if (error.code === 'EACCES') {
                throw new Error(`没有权限删除: ${targetPath}`);
            } else if (error.code === 'EBUSY') {
                throw new Error(`${type}正在被使用: ${targetPath}`);
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error(chalk.red('删除失败:'), error);
    }
}

async function calculateSize(itemPath: string): Promise<number> {
    const stats = await fs.stat(itemPath);

    if (!stats.isDirectory()) {
        return stats.size;
    }

    let totalSize = 0;
    const entries = await fs.readdir(itemPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(itemPath, entry.name);
        if (entry.isDirectory()) {
            totalSize += await calculateSize(fullPath);
        } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
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
        minute: '2-digit'
    });
}
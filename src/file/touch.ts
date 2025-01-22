import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function touchFile(fileName: string) {
    try {
        // 如果没有提供文件名
        if (!fileName) {
            console.error(chalk.red('请提供文件名'));
            return;
        }

        // 转换为绝对路径
        const absolutePath = path.isAbsolute(fileName)
            ? fileName
            : path.resolve(process.cwd(), fileName);

        // 获取目录路径
        const dirPath = path.dirname(absolutePath);

        try {
            // 检查目录是否存在，不存在则创建
            if (!existsSync(dirPath)) {
                await fs.mkdir(dirPath, { recursive: true });
                console.log(chalk.gray(`创建目录: ${dirPath}`));
            }

            // 检查文件是否已存在
            const fileExists = existsSync(absolutePath);

            if (fileExists) {
                // 如果文件存在，更新访问和修改时间
                const now = new Date();
                await fs.utimes(absolutePath, now, now);
                console.log(chalk.green(`✓ 更新文件时间戳: ${fileName}`));
            } else {
                // 创建空文件
                await fs.writeFile(absolutePath, '');
                console.log(chalk.green(`✓ 创建新文件: ${fileName}`));
            }

            // 显示文件信息
            const stats = await fs.stat(absolutePath);
            console.log(chalk.gray('文件信息:'));
            console.log(chalk.gray(`路径: ${absolutePath}`));
            console.log(chalk.gray(`大小: ${formatSize(stats.size)}`));
            console.log(chalk.gray(`创建时间: ${formatDate(stats.birthtime)}`));
            console.log(chalk.gray(`修改时间: ${formatDate(stats.mtime)}`));

        } catch (error: any) {
            if (error.code === 'EACCES') {
                throw new Error(`没有权限访问: ${fileName}`);
            } else if (error.code === 'ENOSPC') {
                throw new Error('磁盘空间不足');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error(chalk.red('创建文件失败:'), error);
    }
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
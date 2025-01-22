import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function makeDirectory(dirPath: string) {
    try {
        // 如果没有提供目录名
        if (!dirPath) {
            console.error(chalk.red('请提供目录名'));
            return;
        }

        // 转换为绝对路径
        const absolutePath = path.isAbsolute(dirPath)
            ? dirPath
            : path.resolve(process.cwd(), dirPath);

        // 检查目录是否已存在
        if (existsSync(absolutePath)) {
            console.log(chalk.yellow(`目录已存在: ${dirPath}`));
            return;
        }

        try {
            // 创建目录（包括所有必需的父目录）
            await fs.mkdir(absolutePath, { recursive: true });
            console.log(chalk.green(`✓ 创建目录成功: ${dirPath}`));

            // 显示目录信息
            const stats = await fs.stat(absolutePath);
            console.log(chalk.gray('目录信息:'));
            console.log(chalk.gray(`路径: ${absolutePath}`));
            console.log(chalk.gray(`创建时间: ${formatDate(stats.birthtime)}`));
            console.log(chalk.gray(`权限: ${formatPermissions(stats.mode)}`));

        } catch (error: any) {
            if (error.code === 'EACCES') {
                throw new Error(`没有权限创建目录: ${dirPath}`);
            } else if (error.code === 'ENOSPC') {
                throw new Error('磁盘空间不足');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error(chalk.red('创建目录失败:'), error);
    }
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

function formatPermissions(mode: number): string {
    return ((mode & 0o400 ? 'r' : '-') +
            (mode & 0o200 ? 'w' : '-') +
            (mode & 0o100 ? 'x' : '-') +
            (mode & 0o040 ? 'r' : '-') +
            (mode & 0o020 ? 'w' : '-') +
            (mode & 0o010 ? 'x' : '-') +
            (mode & 0o004 ? 'r' : '-') +
            (mode & 0o002 ? 'w' : '-') +
            (mode & 0o001 ? 'x' : '-'));
}
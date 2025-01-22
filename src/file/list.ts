import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface FileInfo {
    name: string;
    size: string;
    type: string;
    modified: string;
    permissions: string;
    rawSize: number;
}

export async function listFiles() {
    try {
        const currentDir = process.cwd();
        const entries = await fs.readdirSync(currentDir, { withFileTypes: true });
        const files: FileInfo[] = [];

        // 获取所有文件信息
        for (const entry of entries) {
            // 跳过隐藏文件
            if (entry.name.startsWith('.')) {
                continue;
            }

            const fullPath = path.join(currentDir, entry.name);
            const stats = await fs.statSync(fullPath);
            let size = stats.size;

            // 如果是目录，计算总大小
            if (entry.isDirectory()) {
                size = await calculateDirSize(fullPath);
            }

            files.push({
                name: entry.name,
                size: formatSize(size),
                type: getFileType(entry, stats),
                modified: formatDate(stats.mtime),
                permissions: formatPermissions(stats.mode),
                rawSize: size
            });
        }

        // 排序：目录在前，文件在后，按名称字母排序
        files.sort((a, b) => {
            if (a.type === '目录' && b.type !== '目录') return -1;
            if (a.type !== '目录' && b.type === '目录') return 1;
            return a.name.localeCompare(b.name);
        });

        // 打印当前目录
        console.log(chalk.cyan(`\n当前目录: ${currentDir}\n`));

        // 打印表头
        console.log(chalk.bold(
            padEnd('权限', 12) +
            padEnd('大小', 12) +
            padEnd('类型', 10) +
            padEnd('修改时间', 25) +
            '名称'
        ));
        console.log('─'.repeat(80));

        // 打印文件列表
        for (const file of files) {
            const nameColor = file.type === '目录' ? chalk.blue :
                            file.name.endsWith('.exe') ? chalk.green :
                            chalk.white;

            console.log(
                padEnd(file.permissions, 12) +
                padEnd(file.size, 12) +
                padEnd(file.type, 10) +
                padEnd(file.modified, 25) +
                nameColor(file.name)
            );
        }

        // 计算总大小
        const totalSize = files.reduce((sum, file) => sum + file.rawSize, 0);
        const dirs = files.filter(f => f.type === '目录').length;
        const fileCount = files.length - dirs;

        // 打印统计信息
        console.log('\n' + chalk.gray(`共 ${dirs} 个目录，${fileCount} 个文件，总大小 ${formatSize(totalSize)}`));

    } catch (error) {
        console.error(chalk.red('读取目录失败:'), error);
    }
}

async function calculateDirSize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
        const entries = await fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                totalSize += await calculateDirSize(fullPath);
            } else {
                const stats = await fs.statSync(fullPath);
                totalSize += stats.size;
            }
        }
    } catch (error) {
        console.error(chalk.red(`计算目录大小失败: ${dirPath}`));
    }

    return totalSize;
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

function getFileType(entry: fs.Dirent, stats: fs.Stats): string {
    if (entry.isDirectory()) return '目录';
    if (entry.isSymbolicLink()) return '链接';

    const ext = path.extname(entry.name).toLowerCase();
    switch (ext) {
        case '.exe':
        case '.bat':
        case '.cmd':
            return '可执行文件';
        case '.txt':
        case '.md':
        case '.json':
            return '文本文件';
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
            return '图片';
        case '.mp3':
        case '.wav':
            return '音频';
        case '.mp4':
        case '.avi':
            return '视频';
        case '.zip':
        case '.rar':
        case '.7z':
            return '压缩包';
        default:
            return '文件';
    }
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

function padEnd(str: string, length: number): string {
    return String(str).padEnd(length);
}
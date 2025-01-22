import fs from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import JSZip from 'jszip';

export async function unzipFile(source: string, destination?: string) {
    try {
        // 检查源文件
        if (!source) {
            console.error(chalk.red('请提供要解压的文件路径'));
            console.log(chalk.gray('用法: my unzip <源文件.zip> [目标目录]'));
            return;
        }

        // 转换为绝对路径
        const sourcePath = path.isAbsolute(source)
            ? source
            : path.resolve(process.cwd(), source);

        // 如果没有指定目标路径，则使用当前目录
        const destPath = destination
            ? (path.isAbsolute(destination) ? destination : path.resolve(process.cwd(), destination))
            : path.join(process.cwd(), path.parse(sourcePath).name);

        // 检查源文件是否存在
        if (!existsSync(sourcePath)) {
            console.error(chalk.red(`源文件不存在: ${source}`));
            return;
        }

        // 检查文件扩展名
        if (path.extname(sourcePath).toLowerCase() !== '.zip') {
            console.error(chalk.red('只支持解压 .zip 文件'));
            return;
        }

        // 检查目标目录是否已存在
        if (existsSync(destPath)) {
            console.error(chalk.red(`目标目录已存在: ${destPath}`));
            return;
        }

        console.log(chalk.cyan('准备解压文件:'));
        console.log(chalk.gray(`源文件: ${sourcePath}`));
        console.log(chalk.gray(`目标目录: ${destPath}`));

        // 读取 zip 文件
        const zipData = await fs.readFile(sourcePath);
        const zip = await JSZip.loadAsync(zipData);

        // 获取压缩文件信息
        const fileCount = Object.keys(zip.files).length;
        console.log(chalk.gray(`\n压缩包中包含 ${fileCount} 个文件/目录`));

        // 创建目标根目录
        await fs.mkdir(destPath, { recursive: true });

        // 解压所有文件
        let extractedCount = 0;
        const startTime = Date.now();

        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            const fullPath = path.join(destPath, relativePath);

            // 显示进度
            extractedCount++;
            const percent = Math.floor((extractedCount / fileCount) * 100);
            process.stdout.write(`\r${chalk.gray(`解压进度: ${percent}% (${extractedCount}/${fileCount})`)}`);

            if (zipEntry.dir) {
                // 创建目录
                await fs.mkdir(fullPath, { recursive: true });
            } else {
                // 确保父目录存在
                await fs.mkdir(path.dirname(fullPath), { recursive: true });

                // 解压文件
                const content = await zipEntry.async('nodebuffer');
                await fs.writeFile(fullPath, content);
            }
        }

        // 计算解压后的总大小
        const totalSize = await calculateSize(destPath);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n');
        console.log(chalk.green('✓ 解压完成'));
        console.log(chalk.gray('详细信息:'));
        console.log(chalk.gray(`解压文件数: ${fileCount}`));
        console.log(chalk.gray(`解压后大小: ${formatSize(totalSize)}`));
        console.log(chalk.gray(`耗时: ${duration} 秒`));
        console.log(chalk.gray(`输出目录: ${destPath}`));

    } catch (error) {
        console.error(chalk.red('\n解压失败:'), error);
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

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
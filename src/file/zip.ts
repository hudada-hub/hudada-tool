import fs from 'fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import JSZip from 'jszip';

export async function zipFileOrDirectory(source: string, destination?: string) {
    try {
        // 检查源路径
        if (!source) {
            console.error(chalk.red('请提供要压缩的文件或目录路径'));
            console.log(chalk.gray('用法: my zip <源路径> [目标路径]'));
            return;
        }

        // 转换为绝对路径
        const sourcePath = path.isAbsolute(source)
            ? source
            : path.resolve(process.cwd(), source);

        // 如果没有指定目标路径，则在源路径后加上.zip
        const destPath = destination
            ? (path.isAbsolute(destination) ? destination : path.resolve(process.cwd(), destination))
            : `${sourcePath}.zip`;

        // 检查源路径是否存在
        if (!existsSync(sourcePath)) {
            console.error(chalk.red(`源路径不存在: ${source}`));
            return;
        }

        // 检查目标文件是否已存在
        if (existsSync(destPath)) {
            console.error(chalk.red(`目标文件已存在: ${destPath}`));
            return;
        }

        const stats = await fs.stat(sourcePath);
        const isDirectory = stats.isDirectory();
        const type = isDirectory ? '目录' : '文件';

        console.log(chalk.cyan(`准备压缩${type}:`));
        console.log(chalk.gray(`源: ${sourcePath}`));
        console.log(chalk.gray(`目标: ${destPath}`));

        // 创建新的 ZIP 文件
        const zip = new JSZip();

        // 添加文件到 zip
        if (isDirectory) {
            await addDirectoryToZip(zip, sourcePath, '');
        } else {
            const content = await fs.readFile(sourcePath);
            zip.file(path.basename(sourcePath), content);
        }

        // 生成 zip 文件
        console.log(chalk.gray('\n正在压缩...'));
        const content = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        }, (metadata) => {
            const percent = Math.floor(metadata.percent);
            process.stdout.write(`\r${chalk.gray(`进度: ${percent}%`)}`);
        });

        // 确保目标目录存在
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        // 写入文件
        await fs.writeFile(destPath, content);

        // 获取压缩后的文件大小
        const originalSize = await calculateSize(sourcePath);
        const compressedSize = (await fs.stat(destPath)).size;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        console.log('\n');
        console.log(chalk.green('✓ 压缩完成'));
        console.log(chalk.gray('详细信息:'));
        console.log(chalk.gray(`原始大小: ${formatSize(originalSize)}`));
        console.log(chalk.gray(`压缩后大小: ${formatSize(compressedSize)}`));
        console.log(chalk.gray(`压缩率: ${ratio}%`));
        console.log(chalk.gray(`输出文件: ${destPath}`));

    } catch (error) {
        console.error(chalk.red('\n压缩失败:'), error);
    }
}

async function addDirectoryToZip(zip: JSZip, dirPath: string, relativePath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const zipPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
            const folder = zip.folder(zipPath);
            if (folder) {
                await addDirectoryToZip(zip, fullPath, zipPath);
            }
        } else {
            const content = await fs.readFile(fullPath);
            zip.file(zipPath, content);
        }
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
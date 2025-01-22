import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export async function compressImages() {
    try {
        const currentDir = process.cwd();
        console.log(chalk.cyan('开始处理图片...'));

        // 创建输出目录
        const outputDir = path.join(currentDir, 'compressed');
        await fs.mkdir(outputDir, { recursive: true });

        // 查找所有图片
        const files = await findImageFiles(currentDir);

        if (files.length === 0) {
            console.log(chalk.yellow('当前目录下没有找到图片文件'));
            return;
        }

        console.log(chalk.cyan(`找到 ${files.length} 个图片文件`));

        // 记录原始大小
        const originalSizes = new Map<string, number>();
        for (const file of files) {
            const stat = await fs.stat(file);
            originalSizes.set(file, stat.size);
        }

        // 压缩所有图片
        for (const file of files) {
            const relativePath = path.relative(currentDir, file);
            const fileName = path.parse(file).name;
            const ext = path.parse(file).ext.toLowerCase();
            const outputPath = path.join(
                outputDir,
                path.dirname(relativePath),
                `${fileName}${ext}`
            );

            try {
                // 确保输出目录存在
                await fs.mkdir(path.dirname(outputPath), { recursive: true });

                // 读取图片信息
                const metadata = await sharp(file).metadata();

                // 根据不同格式进行压缩
                let sharpInstance = sharp(file);

                switch (ext) {
                    case '.jpg':
                    case '.jpeg':
                        sharpInstance = sharpInstance.jpeg({
                            quality: 80,
                            mozjpeg: true
                        });
                        break;
                    case '.png':
                        sharpInstance = sharpInstance.png({
                            quality: 80,
                            compressionLevel: 9,
                            palette: true
                        });
                        break;
                    case '.webp':
                        sharpInstance = sharpInstance.webp({
                            quality: 80,
                            effort: 6
                        });
                        break;
                    case '.gif':
                        // GIF 保持原格式
                        sharpInstance = sharpInstance.gif();
                        break;
                }

                // 保存压缩后的图片
                await sharpInstance.toFile(outputPath);

                // 计算压缩比例
                const originalSize = originalSizes.get(file) || 0;
                const compressedSize = (await fs.stat(outputPath)).size;
                const savingPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

                console.log(chalk.green(`✓ ${relativePath}`));
                console.log(chalk.gray(`   尺寸: ${metadata.width}x${metadata.height}`));
                console.log(chalk.gray(`   ${formatSize(originalSize)} → ${formatSize(compressedSize)} (节省 ${savingPercent}%)`));

            } catch (error) {
                console.error(chalk.red(`× 处理失败: ${relativePath}`), error);
            }
        }

        // 显示总体结果
        const totalOriginalSize = Array.from(originalSizes.values()).reduce((a, b) => a + b, 0);
        const totalCompressedSize = await getTotalSize(outputDir);
        const totalSavingPercent = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);

        console.log(chalk.green('\n压缩完成！'));
        console.log(chalk.cyan(`原始总大小: ${formatSize(totalOriginalSize)}`));
        console.log(chalk.cyan(`压缩后总大小: ${formatSize(totalCompressedSize)}`));
        console.log(chalk.cyan(`总节省空间: ${totalSavingPercent}%`));
        console.log(chalk.cyan(`输出目录: ${outputDir}`));

    } catch (error) {
        console.error(chalk.red('处理失败:'), error);
    }
}

async function findImageFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(directory: string) {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.name === 'node_modules' || entry.name === 'compressed') {
                continue;
            }

            if (entry.isDirectory()) {
                await scan(fullPath);
            } else if (entry.isFile() && SUPPORTED_FORMATS.includes(path.extname(entry.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    }

    await scan(dir);
    return files;
}

async function getTotalSize(dir: string): Promise<number> {
    let total = 0;

    async function scan(directory: string) {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await scan(fullPath);
            } else if (entry.isFile()) {
                const stat = await fs.stat(fullPath);
                total += stat.size;
            }
        }
    }

    await scan(dir);
    return total;
}

function formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
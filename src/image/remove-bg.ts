import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { removeBackground, Config } from '@imgly/background-removal-node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// 获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function processImages() {
    try {
        let configModelPath = __dirname;
        const currentDir = process.cwd();
        console.log(chalk.cyan('开始处理图片...'));

        // 配置 WASM 文件路径
        const wasmPath = path.resolve(configModelPath, '../../public/removal/');
        const config: Config = {
            debug: false,
            // output: {
            //   format: 'image/png',
            //   quality: 1,
            // },
             publicPath: `file://${wasmPath.split(path.sep).join('/')}/`
        };

        console.log(chalk.gray(`WASM 路径: ${config.publicPath}`));

        // 查找所有图片
        const files = await findImageFiles(currentDir);

        if (files.length === 0) {
            console.log(chalk.yellow('当前目录下没有找到图片文件'));
            return;
        }


        console.log(chalk.cyan(`找到 ${files.length} 个图片文件`));

        // 处理所有图片
        for (let file of files) {
            const relativePath = path.relative(currentDir, file);
            const fileName = path.parse(file).name;
            let outpath = path.join(path.dirname(file),'koutu');
             fs.mkdirSync(outpath, { recursive: true });
            const outputPath = path.join(
                outpath,
                `${fileName}.png`
            );

            try {
                console.log(chalk.cyan(`处理中: ${relativePath}`));




                let fileUrl = 'file://' + file;
                // 抠图处理
                const resultBlob = await removeBackground(fileUrl,config);

                // 将 Blob 转换为 Buffer
                const arrayBuffer = await resultBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // 保存结果
                await fs.writeFileSync(outputPath, buffer);

                console.log(chalk.green(`✓ 完成: ${path.basename(outputPath)}`));
            } catch (error) {
                console.error(chalk.red(`× 处理失败: ${relativePath}`), error);
                console.error(chalk.gray('错误详情:'), error);
            }
        }

        console.log(chalk.green('\n所有图片处理完成！'));

    } catch (error) {
        console.error(chalk.red('处理失败:'), error);
        console.error(chalk.gray('错误详情:'), error);
    }
}

async function findImageFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(directory: string) {
        const entries = await fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            // 跳过 node_modules 和已处理的图片
            if (entry.name === 'node_modules' || entry.name.endsWith('_koutu.png')) {
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
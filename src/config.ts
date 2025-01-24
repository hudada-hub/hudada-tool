import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';


export  const configDir = join(process.env.HOME || process.env.USERPROFILE || '', '.my-cli');
export  const keyFile = join(configDir, 'ai-key.txt');
// 创建配置目录（如果不存在）
if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
}
export function setApiKey(key: string) {
    try {
        writeFileSync(keyFile, key.trim());
        console.log(chalk.green('API Key 已保存'));
    } catch (error: any) {
        console.error(chalk.red(`保存 API Key 失败: ${error.message}`));
    }finally {
        process.exit(0);
    }
}

export function getApiKey(): string {
    try {
        if (!existsSync(keyFile)) {
            console.error(chalk.yellow('请先配置 API Key: my ai key <your-api-key>'));
            process.exit(1);
        }
        return readFileSync(keyFile, 'utf-8').trim();
    } catch (error: any) {
        console.error(chalk.red(`读取 API Key 失败: ${error.message}`));
        process.exit(1);
    }
}
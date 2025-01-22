import { createHash } from 'crypto';
import chalk from 'chalk';

export function md5String(text: string) {
    if (!text) {
        console.log(chalk.yellow('请输入要加密的字符串'));
        return;
    }
    
    try {
        const hash = createHash('md5');
        hash.update(text);
        const md5Value = hash.digest('hex');
        console.log(chalk.green('原文: ') + text);
        console.log(chalk.green('MD5: ') + md5Value);
    } catch (error) {
        console.error(chalk.red('MD5 加密失败：'), error);
    }
}
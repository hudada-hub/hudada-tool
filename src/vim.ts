import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { join } from 'path';

export async function handleVim(args: string[]) {
    if (args.length === 0) {
        console.log(chalk.yellow('请提供文件名，例如：my vim test.txt'));
        return;
    }

    const filename = args[0];
    const filePath = join(process.cwd(), filename);
    let content: string[] = [];

    // 读取文件内容
    if (existsSync(filePath)) {
        content = readFileSync(filePath, 'utf-8').split('\n');
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(chalk.green('简易编辑器 - 命令：'));
    console.log(chalk.blue(':w') + ' - 保存');
    console.log(chalk.blue(':q') + ' - 退出');
    console.log(chalk.blue(':wq') + ' - 保存并退出');
    console.log(chalk.blue(':n') + ' - 显示行号');
    console.log(chalk.blue(':d 行号') + ' - 删除指定行');
    console.log(chalk.blue(':i 行号 内容') + ' - 在指定行前插入内容');
    console.log('------------------------');

    // 显示当前内容
    showContent(content);

    // 编辑循环
    const edit = async () => {
        try {
            const line = await new Promise<string>(resolve => {
                rl.question('> ', resolve);
            });

            // 处理命令
            if (line.startsWith(':')) {
                const cmd = line.slice(1);

                if (cmd === 'w') {
                    // 保存文件
                    writeFileSync(filePath, content.join('\n'));
                    console.log(chalk.green('文件已保存'));
                    return edit();
                }

                if (cmd === 'q') {
                    // 退出
                    rl.close();
                    return;
                }

                if (cmd === 'wq') {
                    // 保存并退出
                    writeFileSync(filePath, content.join('\n'));
                    console.log(chalk.green('文件已保存'));
                    rl.close();
                    return;
                }

                if (cmd === 'n') {
                    // 显示行号
                    showContent(content, true);
                    return edit();
                }

                if (cmd.startsWith('d ')) {
                    // 删除指定行
                    const lineNum = parseInt(cmd.slice(2)) - 1;
                    if (lineNum >= 0 && lineNum < content.length) {
                        content.splice(lineNum, 1);
                        showContent(content);
                    } else {
                        console.log(chalk.red('无效的行号'));
                    }
                    return edit();
                }

                if (cmd.startsWith('i ')) {
                    // 插入内容
                    const parts = cmd.slice(2).split(' ');
                    const lineNum = parseInt(parts[0]) - 1;
                    const text = parts.slice(1).join(' ');

                    if (lineNum >= 0 && lineNum <= content.length) {
                        content.splice(lineNum, 0, text);
                        showContent(content);
                    } else {
                        console.log(chalk.red('无效的行号'));
                    }
                    return edit();
                }

                console.log(chalk.red('未知命令'));
                return edit();
            }

            // 添加新行
            content.push(line);
            showContent(content);
            return edit();

        } catch (error) {
            console.error(chalk.red('发生错误：', error));
            rl.close();
        }
    };

    await edit();
}

function showContent(content: string[], showLineNumbers = false) {
    console.log('------------------------');
    content.forEach((line, index) => {
        if (showLineNumbers) {
            console.log(chalk.blue(`${index + 1}:`), line);
        } else {
            console.log(line);
        }
    });
    console.log('------------------------');
}
import OpenAI from "openai";
import chalk from 'chalk';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { getApiKey, setApiKey } from './config';

// @ts-ignore
// 配置 marked
marked.use(markedTerminal({
    // 自定义渲染样式
    code: chalk.yellow,
    codespan: chalk.yellow,
    strong: chalk.bold,
    em: chalk.italic,
    heading: chalk.bold.green,
    listitem: chalk.cyan
}));

export async function handleAi(args: string[]) {
    // 处理 key 设置
    if (args[0] === 'key') {
        if (!args[1]) {
            console.error(chalk.yellow('请提供 API Key'));
            return;
        }
        setApiKey(args[1]);
        return;
    }

    // 获取 API Key
    const apiKey = getApiKey();

    let config = {
        baseURL: 'https://api.deepseek.com/',
        apiKey:apiKey.trim()
    }
    const openai = new OpenAI(config);




    try {
        const stream = await openai.chat.completions.create({
            messages: [{ role: "system", content: "你是一名专业的程序员. 你会用中文说话,使用最新的技术来解决问题." },{
                role: "user",
                content: args.join(' ')
            }],
            model: "deepseek-chat",
            stream: true,
        });

        process.stdout.write(chalk.green('AI: \n'));

        let buffer = '';
        let codeBlock = false;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            buffer += content;

            // 检测是否在代码块内
            if (content.includes('```')) {
                codeBlock = !codeBlock;
            }

            // 如果遇到换行符或句号，且不在代码块内，就渲染当前缓冲区
            if ((content.includes('\n') || content.includes('.')) && !codeBlock) {
                // @ts-ignore
                process.stdout.write(marked(buffer));
                buffer = '';
            }
        }

        // 渲染剩余的内容
        if (buffer) {
            // @ts-ignore
            process.stdout.write(marked(buffer));
        }

        // 输出完成后换行
        process.stdout.write('\n');

    } catch (error: any) {
        console.error(chalk.red(`AI 响应失败: ${error.message}`));
    }
}
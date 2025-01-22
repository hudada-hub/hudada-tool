import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface ProcessInfo {
    pid: string;
    name: string;
}

export async function killPort(port: string) {
    try {
        if (!port || isNaN(Number(port))) {
            console.error(chalk.red('请提供有效的端口号'));
            return;
        }

        console.log(chalk.cyan(`正在查找使用端口 ${port} 的进程...`));

        // Windows 命令查找端口占用的进程
        const { stdout: findStdout } = await execAsync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });

        if (!findStdout.trim()) {
            console.log(chalk.yellow(`未找到使用端口 ${port} 的进程`));
            return;
        }

        // 解析进程信息
        const processes = await parseProcessInfo(findStdout, port);

        if (processes.length === 0) {
            console.log(chalk.yellow(`未找到使用端口 ${port} 的进程`));
            return;
        }

        // 显示找到的进程
        console.log(chalk.cyan('\n找到以下进程:'));
        for (const proc of processes) {
            console.log(chalk.gray(`PID: ${proc.pid}\t进程名: ${proc.name}`));
        }

        // 终止所有相关进程
        for (const proc of processes) {
            // 跳过 PID 为 0 或 4 的系统进程
            if (proc.pid === '0' || proc.pid === '4') {
                console.log(chalk.yellow(`跳过系统进程 ${proc.pid} (${proc.name})`));
                continue;
            }

            try {
                await execAsync(`taskkill /F /PID ${proc.pid}`, { encoding: 'utf8' });
                console.log(chalk.green(`✓ 已终止进程 ${proc.pid} (${proc.name})`));
            } catch (error) {
                const err = error as { stderr?: string };
                console.error(chalk.red(`× 终止进程 ${proc.pid} 失败`));
                if (err.stderr) {
                    console.error(chalk.gray(err.stderr));
                }
            }
        }

        console.log(chalk.green(`\n端口 ${port} 已释放`));

    } catch (error) {
        console.error(chalk.red('操作失败:'), error);
    }
}

async function parseProcessInfo(stdout: string, port: string): Promise<ProcessInfo[]> {
    const processes = new Set<string>();
    const result: ProcessInfo[] = [];

    // 解析 netstat 输出
    const lines = stdout.split('\n');
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
            const pid = parts[4];
            // 验证 PID 是否为有效数字
            if (pid && !processes.has(pid) && /^\d+$/.test(pid)) {
                processes.add(pid);
                try {
                    // 获取进程名称
                    const { stdout: nameStdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
                    const name = nameStdout.split(',')[0].replace(/"/g, '').trim();
                    if (name) {
                        result.push({ pid, name });
                    }
                } catch (error) {
                    // 忽略无法获取名称的进程
                }
            }
        }
    }

    return result;
}
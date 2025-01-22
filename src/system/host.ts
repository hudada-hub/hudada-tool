import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import os from 'os';

// hosts 文件路径
const hostsPath = os.platform() === 'win32'
    ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
    : '/etc/hosts';

export async function manageHosts(action?: string, ipOrDomain?: string, domain?: string) {
    try {
        // 检查是否有权限访问 hosts 文件
        try {
            await fs.access(hostsPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            console.error(chalk.red('无权限访问 hosts 文件，请以管理员权限运行'));
            return;
        }

        if (!action) {
            // 如果没有参数，显示当前 hosts 内容
            await showHosts();
            return;
        }

        switch (action.toLowerCase()) {
            case 'add':
                if (!ipOrDomain || !domain) {
                    console.error(chalk.red('请提供 IP 和域名'));
                    console.log(chalk.gray('用法: my host add <IP> <域名>'));
                    return;
                }
                await addHost(ipOrDomain, domain);
                break;

            case 'remove':
                // 删除操作只需要域名参数
                const domainToRemove = ipOrDomain; // 第二个参数作为域名
                if (!domainToRemove) {
                    console.error(chalk.red('请提供要删除的域名'));
                    console.log(chalk.gray('用法: my host remove <域名>'));
                    return;
                }
                await removeHost(domainToRemove);
                break;

            case 'list':
                await showHosts();
                break;

            default:
                console.error(chalk.red('无效的操作'));
                console.log(chalk.gray('支持的操作: add, remove, list'));
                break;
        }
    } catch (error) {
        console.error(chalk.red('操作失败:'), error);
    }
}

async function showHosts() {
    try {
        const content = await fs.readFile(hostsPath, 'utf8');
        const lines = content.split('\n');

        console.log(chalk.cyan('\nhosts 文件内容:'));
        console.log(chalk.gray('路径:'), hostsPath);
        console.log();

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                // 有效的 hosts 记录
                console.log(chalk.white(padEnd(`${index + 1}.`, 4)), line);
            } else if (trimmedLine.startsWith('#')) {
                // 注释行
                console.log(chalk.gray(padEnd(`${index + 1}.`, 4)), chalk.gray(line));
            } else {
                // 空行
                console.log();
            }
        });

        console.log();
    } catch (error) {
        console.error(chalk.red('读取 hosts 文件失败:'), error);
    }
}

async function addHost(ip: string, domain: string) {
    try {
        // 验证 IP 格式
        if (!isValidIP(ip)) {
            console.error(chalk.red('无效的 IP 地址'));
            return;
        }

        // 读取当前内容
        const content = await fs.readFile(hostsPath, 'utf8');
        const lines = content.split('\n');

        // 检查是否已存在
        const exists = lines.some(line => {
            const parts = line.trim().split(/\s+/);
            return parts.length >= 2 && parts[1] === domain;
        });

        if (exists) {
            console.log(chalk.yellow('域名已存在于 hosts 文件中'));
            return;
        }

        // 创建备份
        await fs.writeFile(`${hostsPath}.backup`, content);

        // 添加新记录
        const newLine = `${ip.padEnd(15)} ${domain}`;
        const newContent = content.trim() + '\n' + newLine + '\n';

        await fs.writeFile(hostsPath, newContent);

        console.log(chalk.green('✓ 成功添加 hosts 记录'));
        console.log(chalk.gray('IP:    '), ip);
        console.log(chalk.gray('域名:  '), domain);
        console.log(chalk.gray('备份文件:'), `${hostsPath}.backup`);

    } catch (error) {
        console.error(chalk.red('添加 hosts 记录失败:'), error);
    }
}

async function removeHost(domain: string) {
    try {
        // 读取当前内容
        const content = await fs.readFile(hostsPath, 'utf8');
        const lines = content.split('\n');

        // 检查域名是否存在
        let found = false;
        const newLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return line; // 保留空行和注释行
            }

            const parts = trimmedLine.split(/\s+/);
            if (parts.length >= 2 && parts.includes(domain)) {
                found = true;
                return ''; // 删除匹配的行
            }
            return line;
        }).filter(line => line !== ''); // 移除空行

        if (!found) {
            console.log(chalk.yellow(`未找到域名 ${domain} 的记录`));
            return;
        }

        // 创建备份
        await fs.writeFile(`${hostsPath}.backup`, content);

        // 写入新内容，确保文件末尾有换行符
        const newContent = newLines.join('\n').trim() + '\n';
        await fs.writeFile(hostsPath, newContent);

        console.log(chalk.green('✓ 成功删除 hosts 记录'));
        console.log(chalk.gray('域名:  '), domain);
        console.log(chalk.gray('备份文件:'), `${hostsPath}.backup`);

    } catch (error) {
        console.error(chalk.red('删除 hosts 记录失败:'), error);
    }
}

function isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every(part => {
        const num = parseInt(part);
        return !isNaN(num) && num >= 0 && num <= 255;
    });
}

function padEnd(str: string, length: number): string {
    return String(str).padEnd(length);
}
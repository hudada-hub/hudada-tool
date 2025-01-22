import os from 'os';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { networkInterfaces } from 'os';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

interface DiskInfo {
    filesystem: string;
    size: string;
    used: string;
    available: string;
    usedPercent: string;
    mounted: string;
}

export async function getSystemInfo() {
    try {
        console.log(chalk.cyan('\n系统信息:'));
        printBasicInfo();
        printCPUInfo();
        printMemoryInfo();
        await printDiskInfo();
        printNetworkInfo();
    } catch (error) {
        console.error(chalk.red('获取系统信息失败:'), error);
    }
}

function printBasicInfo() {
    console.log(chalk.yellow('\n基本信息:'));
    console.log(chalk.gray('操作系统:    '), os.type(), os.release());
    console.log(chalk.gray('计算机名:    '), os.hostname());
    console.log(chalk.gray('系统架构:    '), os.arch());
    console.log(chalk.gray('系统平台:    '), os.platform());
    console.log(chalk.gray('用户目录:    '), os.homedir());
    console.log(chalk.gray('系统运行时间:'), formatUptime(os.uptime()));
}

function printCPUInfo() {
    const cpus = os.cpus();
    console.log(chalk.yellow('\nCPU信息:'));
    console.log(chalk.gray('处理器:      '), cpus[0].model);
    console.log(chalk.gray('核心数:      '), cpus.length);
    console.log(chalk.gray('主频:        '), `${(cpus[0].speed / 1000).toFixed(2)} GHz`);

    // CPU 使用率
    const totalCPU = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return {
            total: acc.total + total,
            idle: acc.idle + idle
        };
    }, { total: 0, idle: 0 });

    const cpuUsage = ((1 - totalCPU.idle / totalCPU.total) * 100).toFixed(1);
    console.log(chalk.gray('CPU使用率:   '), `${cpuUsage}%`);
}

function printMemoryInfo() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(1);

    console.log(chalk.yellow('\n内存信息:'));
    console.log(chalk.gray('总内存:      '), formatSize(totalMem));
    console.log(chalk.gray('已用内存:    '), formatSize(usedMem));
    console.log(chalk.gray('可用内存:    '), formatSize(freeMem));
    console.log(chalk.gray('内存使用率:  '), `${memUsage}%`);

    // 显示内存使用进度条
    const barWidth = 30;
    const usedWidth = Math.floor((usedMem / totalMem) * barWidth);
    const bar = '█'.repeat(usedWidth) + '░'.repeat(barWidth - usedWidth);
    console.log(chalk.gray('使用情况:    '), bar);
}

async function printDiskInfo() {
    console.log(chalk.yellow('\n磁盘信息:'));

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let basePaht = path.resolve(__dirname, '../../', 'public');
    try {
        let command = '';
        if (os.platform() === 'win32') {


            command = basePaht + '/wmic logicaldisk get size,freespace,caption';
        } else {
            command = 'df -h';
        }

        const { stdout } = await execAsync(command);

        if (os.platform() === 'win32') {
            // Windows 磁盘信息解析
            const lines = stdout.trim().split('\n').slice(1);
            for (const line of lines) {
                const [caption, freeSpace, size] = line.trim().split(/\s+/);
                if (caption && freeSpace && size) {
                    const used = parseInt(size) - parseInt(freeSpace);
                    const usedPercent = ((used / parseInt(size)) * 100).toFixed(1);
                    console.log(chalk.gray(`${caption}盘:`));
                    console.log(chalk.gray('  总大小:     '), formatSize(parseInt(size)));
                    console.log(chalk.gray('  已用空间:   '), formatSize(used));
                    console.log(chalk.gray('  可用空间:   '), formatSize(parseInt(freeSpace)));
                    console.log(chalk.gray('  使用率:     '), `${usedPercent}%`);
                    console.log();
                }
            }
        } else {
            // Unix 系统磁盘信息解析
            const lines = stdout.trim().split('\n').slice(1);
            for (const line of lines) {
                const [filesystem, size, used, available, usedPercent, mounted] = line.trim().split(/\s+/);
                console.log(chalk.gray(`${mounted}:`));
                console.log(chalk.gray('  文件系统:   '), filesystem);
                console.log(chalk.gray('  总大小:     '), size);
                console.log(chalk.gray('  已用空间:   '), used);
                console.log(chalk.gray('  可用空间:   '), available);
                console.log(chalk.gray('  使用率:     '), usedPercent);
                console.log();
            }
        }
    } catch (error) {
        console.error(chalk.red('获取磁盘信息失败'));
    }
}

function printNetworkInfo() {
    console.log(chalk.yellow('\n网络信息:'));
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        const interfaces = nets[name];
        if (interfaces) {
            for (const net of interfaces) {
                // 跳过内部接口
                if (!net.internal) {
                    console.log(chalk.gray('接口名称:    '), name);
                    console.log(chalk.gray('IP地址:      '), net.address);
                    console.log(chalk.gray('MAC地址:     '), net.mac);
                    console.log(chalk.gray('子网掩码:    '), net.netmask);
                    console.log(chalk.gray('协议族:      '), net.family);
                    console.log();
                }
            }
        }
    }
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const parts = [];

    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分钟`);

    return parts.join(' ');
}

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}
import fs from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

interface FindOptions {
    name?: string;        // 按名称搜索（支持通配符）
    type?: 'f' | 'd';     // f: 文件, d: 目录
    size?: string;        // 文件大小过滤 (>100MB, <1GB 等)
    ext?: string;         // 文件扩展名
    mtime?: number;       // 修改时间（天数内）
    maxdepth?: number;    // 最大搜索深度
}

interface SearchResult {
    path: string;
    type: 'file' | 'directory';
    size: number;
    modified: Date;
}
function parseArgv(argv: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    // 跳过前两个参数（node可执行文件路径和脚本路径）
    let args = argv.slice(2);
      // 第一个参数作为搜索路径
      if (args.length > 0 && !args[0].includes('=')) {
        result['path'] = args[0];
        args.shift();
    }

    // 处理剩余的参数
    for (const arg of args) {
        if (arg.includes('=')) {
            const [key, value] = arg.split('=');
            const cleanKey = key.replace(/^-+/, '');
            // 如果值包含引号，去除它们
            const cleanValue = value.replace(/^["']|["']$/g, '');
            result[cleanKey] = cleanValue;
        }
    }
    
    return result;
}


   
export async function findItems() {
    
    try {

        let pattern='';
        let searchPath='';
        
        const options1 = parseArgv(process.argv);
   
    
         // 设置搜索路径
         const basePath =  process.cwd();
         console.log(basePath);
         
        if (!existsSync(basePath)) {
            console.error(chalk.red(`路径不存在: ${basePath}`));
            return;
        }
        // 移除 path 属性，只保留搜索条件
        delete options1.path;
             
        // 解析搜索参数
        const options: FindOptions = options1;
        console.log(chalk.cyan('开始搜索:'));
        console.log(chalk.gray(`搜索路径: ${basePath}`));
        console.log(options);
        
        if (Object.keys(options).length > 0) {
            console.log(chalk.gray('搜索条件:'));
            if (options.name) console.log(chalk.gray(`- 名称: ${options.name}`));
            if (options.type) console.log(chalk.gray(`- 类型: ${options.type === 'f' ? '文件' : '目录'}`));
            if (options.size) console.log(chalk.gray(`- 大小: ${options.size}`));
            if (options.ext) console.log(chalk.gray(`- 扩展名: ${options.ext}`));
            if (options.mtime) console.log(chalk.gray(`- 修改时间: ${options.mtime}天内`));
            if (options.maxdepth) console.log(chalk.gray(`- 最大深度: ${options.maxdepth}`));
        }

        // 开始搜索
        const results: SearchResult[] = [];
        const startTime = Date.now();

        await searchFiles(basePath, options, results, 0);

        // 按类型和名称排序
        results.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return path.basename(a.path).localeCompare(path.basename(b.path));
        });

        // 显示结果
        if (results.length === 0) {
            console.log(chalk.yellow('\n未找到匹配项'));
        } else {
            console.log(chalk.green(`\n找到 ${results.length} 个匹配项:`));

            for (const result of results) {
                const absolutePath = path.resolve(basePath, result.path);
                const name = path.basename(result.path);
                const nameColor = result.type === 'directory' ? chalk.blue : chalk.white;

                console.log(
                    nameColor(padEnd(name, 30)) +
                    chalk.gray(padEnd(formatSize(result.size), 12)) +
                    chalk.gray(padEnd(formatDate(result.modified), 20)) +
                    chalk.gray(absolutePath)
                );
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(chalk.gray(`\n搜索完成，耗时 ${duration} 秒`));

    } catch (error) {
        console.error(chalk.red('搜索失败:'), error);
    }
}

async function searchFiles(
    currentPath: string,
    options: FindOptions,
    results: SearchResult[],
    depth: number
): Promise<void> {
    // 检查深度限制
    if (options.maxdepth !== undefined && depth > options.maxdepth) {
        return;
    }
    let entries: fs.Dirent[];
    try {
        entries = await fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (error) {
        console.error(chalk.yellow(`警告: 无法访问目录 ${currentPath}: ${(error as Error).message}`));
        return;
    }
  

    for (const entry of entries) {
        // 跳过隐藏文件和特定目录
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
        }

        const fullPath = path.join(currentPath, entry.name);
        try {
        const stats = await fs.statSync(fullPath);

        // 检查是否匹配搜索条件
        if (matchesSearchCriteria(entry, stats, options)) {
            results.push({
                path: fullPath,
                type: entry.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime
            });
        }
        

        // 递归搜索子目录
        if (entry.isDirectory()) {
            await searchFiles(fullPath, options, results, depth + 1);
        }
        } catch (error) {
            console.error(chalk.yellow(`警告: 无法访问文件 ${fullPath}: ${(error as Error).message}`));
            continue;
        }
    }
}

function matchesSearchCriteria(
    entry: fs.Dirent,
    stats: fs.Stats,
    options: FindOptions
): boolean {
    // 类型检查
    if (options.type) {
        if (options.type === 'f' && entry.isDirectory()) return false;
        if (options.type === 'd' && !entry.isDirectory()) return false;
    }

    // 名称检查
    if (options.name) {
        const pattern = new RegExp(options.name.replace(/\*/g, '.*'));
        if (!pattern.test(entry.name)) return false;
    }

    // 扩展名检查
    if (options.ext && !entry.isDirectory()) {
        const fileExt = path.extname(entry.name).toLowerCase();
        if (fileExt !== `.${options.ext.toLowerCase()}`) return false;
    }

    // 大小检查
    if (options.size && !entry.isDirectory()) {
        const size = parseSize(options.size);
        if (size && !matchesSize(stats.size, size)) return false;
    }

    // 修改时间检查
    if (options.mtime) {
        const mtime = stats.mtime.getTime();
        const now = Date.now();
        const days = (now - mtime) / (1000 * 60 * 60 * 24);
        if (days > options.mtime) return false;
    }

    return true;
}

function parseSize(sizeStr: string): { op: '>' | '<' | '>=' | '<=' | '=' | 'range'; size: number; size2?: number } | null {
    // 处理范围查询 (例如：1MB-10MB)
    if (sizeStr.includes('-')) {
        const [min, max] = sizeStr.split('-');
        const minSize = parseSimpleSize(min);
        const maxSize = parseSimpleSize(max);
        if (minSize && maxSize) {
            return {
                op: 'range',
                size: minSize,
                size2: maxSize
            };
        }
        return null;
    }

    // 处理单个值查询
    const match = sizeStr.match(/^([<>]=?|=)?\s*(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);
    if (!match) return null;

    const [, op = '=', value, unit] = match;
    const size = parseSimpleSize(`${value}${unit || ''}`);
    if (!size) return null;

    return {
        op: op as '>' | '<' | '>=' | '<=' | '=',
        size
    };
}

function parseSimpleSize(sizeStr: string): number | null {
    const match = sizeStr.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);
    if (!match) return null;

    const [, value, unit] = match;
    let multiplier = 1;
    switch (unit?.toUpperCase()) {
        case 'KB': multiplier = 1024; break;
        case 'MB': multiplier = 1024 * 1024; break;
        case 'GB': multiplier = 1024 * 1024 * 1024; break;
        case 'TB': multiplier = 1024 * 1024 * 1024 * 1024; break;
    }

    return parseFloat(value) * multiplier;
}


function matchesSize(fileSize: number, criteria: { op: '>' | '<' | '>=' | '<=' | '=' | 'range'; size: number; size2?: number }): boolean {
    switch (criteria.op) {
        case '>': return fileSize > criteria.size;
        case '<': return fileSize < criteria.size;
        case '>=': return fileSize >= criteria.size;
        case '<=': return fileSize <= criteria.size;
        case '=': return Math.abs(fileSize - criteria.size) < 1; // 允许 1 字节的误差
        case 'range': return criteria.size2 !== undefined && 
                            fileSize >= criteria.size && 
                            fileSize <= criteria.size2;
        default: return false;
    }
}


function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(date: Date): string {
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function padEnd(str: string, length: number): string {
    return String(str).padEnd(length);
}
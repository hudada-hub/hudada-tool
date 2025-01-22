import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

export async function base64String(filePath: string) {
    try {
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            // 处理网络文件
            await handleNetworkFile(filePath);
        } else {
            // 处理本地文件
            await handleLocalFile(filePath);
        }
    } catch (error: any) {
        console.error(chalk.red('转换失败：'), error.message);
    }
}

async function handleLocalFile(filePath: string) {
    // 获取绝对路径
    const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error('文件不存在');
    }

    const buffer = fs.readFileSync(absolutePath);
    const base64String = buffer.toString('base64');
    const mimeType = getMimeType(filePath);
    
    outputResult(filePath, mimeType, base64String);
}

async function handleNetworkFile(url: string) {
    const client = url.startsWith('https') ? https : http;
    
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${res.statusCode}`));
                return;
            }

            const chunks: Buffer[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64String = buffer.toString('base64');
                const mimeType = getMimeType(url);
                
                outputResult(url, mimeType, base64String);
                resolve(null);
            });
        }).on('error', reject);
    });
}

function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
}

function outputResult(filePath: string, mimeType: string, base64String: string) {
    console.log(chalk.green('文件路径：') + filePath);
    console.log(chalk.green('MIME 类型：') + mimeType);
    console.log(chalk.green('Base64 字符串：'));
    console.log(`data:${mimeType};base64,${base64String}`);
}
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import chalk from 'chalk';
import open from 'open';
import { readdirSync, watch } from 'fs';
import { Server } from 'socket.io';

const MIME_TYPES: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

export async function startPreview(port = 1101) {
    const server = createServer(async (req, res) => {
        try {
            const url = req.url === '/' ? '/index.html' : req.url;
            const filePath = join(process.cwd(), url || '');
            const ext = extname(filePath).toLowerCase();

            // 处理 HTML 文件，注入 socket.io 客户端代码
            if (ext === '.html' || url === '/') {
                let content = await readFile(filePath, 'utf-8');
                const refreshScript = `
                    <script src="/socket.io/socket.io.js"></script>
                    <script>
                        const socket = io();
                        socket.on('refresh', () => {
                            location.reload();
                        });
                    </script>
                `;
                content = content.replace('</body>', `${refreshScript}</body>`);
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
                return;
            }

            // 处理其他文件
            res.setHeader('Content-Type', MIME_TYPES[ext] || 'text/plain');
            const content = await readFile(filePath);
            res.end(content);

        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                const dirPath = process.cwd();
                const files = await listHtmlFiles(dirPath);

                res.setHeader('Content-Type', 'text/html');
                res.end(`
                    <html>
                        <head>
                            <title>Directory Listing</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                a { color: #0366d6; text-decoration: none; }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <h2>Available HTML Files:</h2>
                            ${files.map(file => `
                                <div><a href="/${file}">${file}</a></div>
                            `).join('')}
                            <script src="/socket.io/socket.io.js"></script>
                            <script>
                                const socket = io();
                                socket.on('refresh', () => {
                                    location.reload();
                                });
                            </script>
                        </body>
                    </html>
                `);
            } else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }
    });

    // 创建 socket.io 服务器
    const io = new Server(server);

    // 监听文件变化
    watch(process.cwd(), { recursive: true }, (eventType, filename) => {
        if (filename) {
            console.log(chalk.blue(`检测到文件变化: ${filename}`));
            io.emit('refresh');
        }
    });

    server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(chalk.green(`预览服务器启动在: ${url}`));
        console.log(chalk.blue('文件监听已启动，修改文件将自动刷新浏览器'));
        open(url);
    });

    // 错误处理
    server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            console.log(chalk.yellow(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}`));
            startPreview(port + 1);
        } else {
            console.error(chalk.red(`服务器错误: ${error.message}`));
        }
    });

    // 优雅退出
    process.on('SIGINT', () => {
        console.log(chalk.yellow('\n正在关闭服务器...'));
        io.close();
        server.close(() => {
            console.log(chalk.green('服务器已关闭'));
            process.exit(0);
        });
    });
}

async function listHtmlFiles(dir: string): Promise<string[]> {

    const files = readdirSync(dir);
    return files.filter((file: string) => file.endsWith('.html'));
}
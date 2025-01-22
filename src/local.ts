import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createReadStream, createWriteStream, mkdirSync, existsSync, statSync, readdirSync, readFileSync, rm, rmSync } from 'fs';
import path, { join, extname, dirname, relative, isAbsolute } from 'path';
import chalk from 'chalk';
import open from 'open';
import { networkInterfaces } from 'os';
import { fileURLToPath, parse } from 'url';
import JSZip from 'jszip';
import d from 'zlib'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(process.cwd(), 'uploads');

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
};
async function handleStaticFile(req: IncomingMessage, res: ServerResponse, path: string) {
    try {
        // 移除 URL 中的 /static 前缀
        const relativePath = path.replace(/^\/static/, '');
        // 构建完整的文件路径
        const filePath = join(__dirname, 'template', relativePath);

        console.log(filePath,'filePath');

        // 检查文件是否存在
        if (!existsSync(filePath)) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        // 获取文件状态
        const stat = statSync(filePath);
        if (!stat.isFile()) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // 获取文件扩展名
        const ext = extname(filePath).toLowerCase();
        // 设置 Content-Type
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // 设置响应头
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=3600' // 1小时缓存
        });

        // 创建文件读取流并输出
        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('静态文件处理错误:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}


// 添加一个函数来获取文件夹结构
function getFolderStructure(dir: string, basePath = '') {
    const items: any[] = [];
    const files = readdirSync(dir);
// 按照文件夹在前，文件在后的顺序排序
const sortedFiles = files.sort((a, b) => {
    const aPath = join(dir, a);
    const bPath = join(dir, b);
    const aIsDir = statSync(aPath).isDirectory();
    const bIsDir = statSync(bPath).isDirectory();

    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b); // 同类型按名称排序
});
sortedFiles.forEach(file => {
    const fullPath = join(dir, file);
    const relativePath = join(basePath, file);
    const stats = statSync(fullPath);
    const size = stats.size;
    const mtime = stats.mtime.toLocaleString(); // 添加修改时间

    if (stats.isDirectory()) {
        items.push({
            type: 'directory',
            name: file,
            path: relativePath,
            size: 0,
            mtime,
            items: getFolderStructure(fullPath, relativePath)
        });
    } else {
        items.push({
            type: 'file',
            name: file,
            path: relativePath,
            size,
            mtime,
            ext: extname(file).toLowerCase() // 添加文件扩展名
        });
    }
});

return items;
}




export async function startLocalServer(port = 667) {

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const url = parse(req.url || '', true);
            const path = url.pathname || '/';
            console.log('请求路径:', path);

            // 设置 CORS 头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // 处理预检请求
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // 处理静态文件请求
            if (path.startsWith('/static/')) {
                await handleStaticFile(req, res, path);
                return;
            }

            // 处理文件上传
            if (req.method === 'POST' && path === '/upload') {
                await handleFileUpload(req, res);
                return;
            }
            // 处理文件夹下载
            if (req.method === 'GET' && path === '/download-folder') {
                await handleFolderDownload(req, res, url.query);
                return;
            }

            // 处理文件删除
            if (req.method === 'DELETE' && path === '/delete') {
                await handleFileDelete(req, res, url.query);
                return;
            }

            // 处理主页请求
            if (path === '/') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });


                res.end(getHtmlContent());
                return;
            }

            // 处理上传文件的访问
            if (path.startsWith('/uploads/')) {
                await handleFileAccess(req, res, path);
                return;
            }

            // 404 处理
            res.writeHead(404);
            res.end('Not Found');

        } catch (error) {
            console.error('请求处理错误:', error);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    });

    // 确保上传目录存在

    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
    }

    // 在服务器处理函数中添加文件夹下载处理







    // 启动服务器
    server.listen(port, () => {
        let baseDir=  path.normalize(process.cwd()+'/uploads');

        const localIP = getLocalIP();
        const url = `http://${localIP}:${port}`;
        console.log(chalk.green(`文件传输服务已启动！`));
        console.log(chalk.blue(`本地访问: http://localhost:${port}`));
        console.log(chalk.blue(`局域网访问: ${url}`));
        console.log(chalk.yellow('文件将传输在本地的 '+baseDir+' 目录中'));
        open(url);
    });

    // 错误处理
    server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            console.log(chalk.yellow(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}`));
            startLocalServer(port + 1);
        } else {
            console.error(chalk.red('服务器错误：'), error.message);
        }
    });

    // 优雅退出
    process.on('SIGINT', () => {
        console.log(chalk.yellow('\n正在关闭服务器...'));
        server.close(() => {
            console.log(chalk.green('服务器已关闭'));
            process.exit(0);
        });
    });
}


// 处理文件访问
async function handleFileAccess(req: IncomingMessage, res: ServerResponse, path: string) {
    console.log(path,'path');
    const filePath = join(process.cwd(), decodeURIComponent(path));
    if (existsSync(filePath) && statSync(filePath).isFile()) {
        const stream = createReadStream(filePath);
        stream.pipe(res);
    } else {
        res.writeHead(404);
        res.end('File not found');
    }
}

// 处理文件删除
async function handleFileDelete(req: IncomingMessage, res: ServerResponse, query: any) {
    try {
        const path = query.path as string;
        if (!path) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, message: '缺少路径参数' }));
            return;
        }

        const fullPath = join(process.cwd(), 'uploads', path);

        // 检查路径是否在 uploads 目录内
        const relativePath = relative(join(process.cwd(), 'uploads'), fullPath);
        if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
            res.writeHead(403);
            res.end(JSON.stringify({ success: false, message: '非法的文件路径' }));
            return;
        }

        // 检查文件/文件夹是否存在
        if (!existsSync(fullPath)) {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, message: '文件不存在' }));
            return;
        }

        // 递归删除文件或文件夹
        await rmSync(fullPath, { recursive: true, force: true });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '删除成功' }));

    } catch (error) {
        console.error('删除文件错误:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, message: '删除失败' }));
    }
}

// 处理文件夹下载
async function handleFolderDownload(req: IncomingMessage, res: ServerResponse, query: any) {
    try {
        const path = query.path as string;
        if (!path) {
            res.writeHead(400);
            res.end('Missing path parameter');
            return;
        }

        const fullPath = join(process.cwd(), 'uploads', path);

        // 检查路径是否在 uploads 目录内
        const relativePath = relative(join(process.cwd(), 'uploads'), fullPath);
        if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // 检查文件夹是否存在
        if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
            res.writeHead(404);
            res.end('Folder not found');
            return;
        }

        // 创建 zip 文件
        const zip = new JSZip();

        // 递归添加文件到 zip
        async function addFolderToZip(folderPath: string, zipFolder: JSZip) {
            const files = readdirSync(folderPath);

            for (const file of files) {
                const filePath = join(folderPath, file);
                const stat = statSync(filePath);
                if (stat.isDirectory()) {
                    // 创建文件夹并递归
                    const newZipFolder = zipFolder.folder(file);
                    if (newZipFolder) {
                        await addFolderToZip(filePath, newZipFolder);
                    }
                } else {
                    // 添加文件
                    const content = readFileSync(filePath);
                    zipFolder.file(file, content);
                }
            }
        }

        // 开始添加文件
        await addFolderToZip(fullPath, zip);

        // 生成 zip 文件
        const zipContent = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });

        // 设置响应头
        const folderName = path.split('/').pop() || 'download';
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
            'Content-Length': zipContent.length
        });

        // 发送 zip 文件
        res.end(zipContent);

    } catch (error) {
        console.error('文件夹下载错误:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

// HTML 内容
function getHtmlContent() {
    // 读取上传目录中的文件
    const uploadDir = join(process.cwd(), 'uploads');
    let fileListHtml = '';
    let fileStructure = [];
    if (existsSync(uploadDir)) {
        fileStructure = getFolderStructure(uploadDir);
    }
    try {
        // 读取 HTML 模板
        let jsTemplate = readFileSync(join(__dirname, 'template', 'index.js'), 'utf-8');




        // 替换模板中的变量
        jsTemplate = jsTemplate.replace(
            '{{ fileStructure }}',
            JSON.stringify(fileStructure, null, 2)
        );
        let HTMLTemplate = readFileSync(join(__dirname, 'template', 'index.html'), 'utf-8');
        //将jsTemplate插入到HTMLTemplate中的src中


        HTMLTemplate=HTMLTemplate.replace(
            '{{jsTemplate}}',
            jsTemplate
        );





        return HTMLTemplate;
    } catch (error) {
        console.error(chalk.red('读取模板文件失败：'), error);
        // 返回一个简单的错误页面
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>错误</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1>加载页面失败</h1>
                    <p>请确保 template/index.html 文件存在</p>
                </body>
            </html>
        `;
    }
}

// 处理文件上传
async function handleFileUpload(req: IncomingMessage, res: ServerResponse) {
    const boundary = getBoundary(req.headers['content-type'] || '');
    if (!boundary) {
        res.writeHead(400);
        res.end('Invalid Content-Type');
        return;
    }

    let fileName = '';
    let filePath = '';
    let fileStream: any = null;
    let data = Buffer.from('');

    req.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);

        if (!fileStream && data.includes(Buffer.from('filename="'))) {
            // 获取文件名和路径
            const content = data.toString();
            const nameMatch = content.match(/filename="(.+?)"/);
            const pathMatch = content.match(/name="path"\r\n\r\n(.+?)\r\n/);

            if (nameMatch) {
                fileName = nameMatch[1];
                const relativePath = pathMatch ? pathMatch[1] : '';

                // 处理文件路径中的目录部分
                const fullPath = join(uploadDir, relativePath, fileName);
                const dirPath = dirname(fullPath);

                // 确保目录存在
                try {
                    mkdirSync(dirPath, { recursive: true });
                    console.log(chalk.green(`✓ 创建目录: ${relative(uploadDir, dirPath) || '根目录'}`));
                } catch (error) {
                    console.error(chalk.red('创建目录失败:'), error);
                    res.writeHead(500);
                    res.end('Failed to create directory');
                    return;
                }

                filePath = fullPath;
                fileStream = createWriteStream(filePath);

                // 找到文件内容的开始位置
                const fileStart = data.indexOf(Buffer.from('\r\n\r\n')) + 4;
                const fileContent = data.slice(fileStart);
                fileStream.write(fileContent);
                data = Buffer.from('');
            }
        } else if (fileStream) {
            fileStream.write(chunk);
        }
    });

    req.on('end', () => {
        if (fileStream) {
            fileStream.end();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                filename: fileName,
                path: filePath.replace(uploadDir, '').replace(/\\/g, '/').replace(/^\//, '')
            }));
        } else {
            res.writeHead(400);
            res.end('No file uploaded');
        }
    });

    req.on('error', (error) => {
        console.error(chalk.red('上传错误:'), error);
        if (fileStream) {
            fileStream.end();
            // 如果上传失败，删除已创建的文件
            try {
                rmSync(filePath);
            } catch (e) {
                console.error(chalk.red('清理临时文件失败:'), e);
            }
        }
        res.writeHead(500);
        res.end('Upload failed');
    });
}

function getBoundary(contentType: string): string | null {
    const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    return match ? match[1] || match[2] : null;
}

// 获取本地 IP 地址
function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (!net.internal && net.family === 'IPv4') {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// 统一的 addFolderToZip 函数 (删除重复定义)
async function addFolderToZip(zip: JSZip, folderPath: string, relativePath: string) {
    const files = readdirSync(folderPath);

    for (const file of files) {
        const fullPath = join(folderPath, file);
        const fileRelativePath = join(relativePath, file);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            // 创建文件夹
            const folderZip = zip.folder(fileRelativePath);
            if (folderZip) {
                await addFolderToZip(folderZip, fullPath, '');
            }
        } else {
            // 添加文件
            const content = readFileSync(fullPath);
            zip.file(fileRelativePath, content);
        }
    }
}
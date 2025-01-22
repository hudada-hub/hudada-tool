import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'ssh2';
import chalk from 'chalk';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { parse } from 'url';
import open from 'open';
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');


interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

// 添加文件上传会话管理
interface UploadSession {
  filename: string;
  chunks: Buffer[];
  totalChunks: number;
  receivedChunks: number;
}

export async function startSSHServer(port = 669) {
  const httpServer = createServer((req, res) => {
    // 处理静态文件
    const url = parse(req.url || '');
    const path = url.pathname || '/';
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      if (path === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          console.log(__dirname,'__dirname');

           // 修改为正确的 HTML 文件路径
           createReadStream(join(__dirname, './ssh/client/index.html')).pipe(res);
           return;
      }


          // 处理客户端 JS 文件
          if (path.endsWith('.js')) {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            createReadStream(join(__dirname, './ssh/client', path)).pipe(res);
            return;
        }

        // 处理样式文件
        if (path.endsWith('.css')) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            createReadStream(join(__dirname, './ssh/client', path)).pipe(res);
            return;
        }


    res.writeHead(404);
    res.end('Not Found');
  } catch (error) {
    console.error('Static file error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
}
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],  // 支持 WebSocket 和轮询
    path: '/socket.io/'  // 默认路径
  });
  // 文件上传会话管理
  const uploadSessions = new Map<string, UploadSession>();

  // 处理 WebSocket 连接
  io.on('connection', (socket) => {
    console.log(chalk.green('Client connected'));
    let sshClient: Client | null = null;

    // 处理 SSH 连接请求
    socket.on('ssh:connect', async (config: SSHConfig) => {
      try {
        sshClient = new Client();

        sshClient.on('ready', () => {
          console.log(chalk.blue(`SSH connection established to ${config.host}`));
          socket.emit('ssh:ready');

          // 创建 Shell
          sshClient?.shell({ term: 'xterm-256color' }, (err: any, stream: any) => {
            if (err) {
              socket.emit('ssh:error', err.message);
              return;
            }

            // 处理终端数据
            stream.on('data', (data: Buffer) => {
              socket.emit('ssh:data', data.toString('utf-8'));
            });

            // 处理终端错误
            stream.on('error', (err: any) => {
              socket.emit('ssh:error', err.message);
            });

            // 处理终端关闭
            stream.on('close', () => {
              socket.emit('ssh:close');
              if (sshClient) {
                sshClient.end();
                sshClient = null;
              }
            });

            // 处理客户端输入
            socket.on('ssh:data', (data: string) => {
              if (stream && !stream.closed) {
                stream.write(data);
              }
            });

            // 处理终端大小调整
            socket.on('ssh:resize', ({ rows, cols }) => {
              if (stream && !stream.closed) {
                stream.setWindow(rows, cols, 0, 0);
              }
            });
          });
        });

        // 处理 SSH 连接错误
        sshClient.on('error', (err) => {
          console.error(chalk.red('SSH connection error:'), err);
          socket.emit('ssh:error', err.message);
        });

        // 处理 SSH 连接关闭
        sshClient.on('close', () => {
          console.log(chalk.yellow('SSH connection closed'));
          socket.emit('ssh:close');
          sshClient = null;
        });

        // 连接到 SSH 服务器
        sshClient.connect({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          readyTimeout: 20000, // 20 秒超时
          keepaliveInterval: 10000, // 每 10 秒发送心跳
        });

      } catch (error) {
        console.error(chalk.red('SSH connection error:'), error);
        socket.emit('ssh:error', error instanceof Error ? error.message : 'Unknown error');
      }
    });


        // 处理文件上传开始
        socket.on('upload-start', async (data: {
          filename: string;
          totalSize: number;
          totalChunks: number
      }) => {
          try {
              console.log(chalk.blue(`Starting upload for ${data.filename}`));
              uploadSessions.set(data.filename, {
                  filename: data.filename,
                  chunks: new Array(data.totalChunks),
                  totalChunks: data.totalChunks,
                  receivedChunks: 0
              });

              // 确认上传开始
              socket.emit('upload-started', { filename: data.filename });
          } catch (error:any) {
              console.error(chalk.red('Upload start error:'), error);
              socket.emit('upload-error', {
                  message: `Upload start failed: ${error.message}`
              });
          }
      });


        // 处理文件分片上传
        socket.on('upload-chunk', async (data: {
          filename: string;
          content: string;
          chunkIndex: number;
          totalChunks: number;
          size: number;
      }) => {
          try {
              const session = uploadSessions.get(data.filename);
              if (!session) {
                  throw new Error('Upload session not found');
              }

              // 将 Base64 字符串转换回二进制数据
              const binaryContent = Buffer.from(data.content, 'base64');
              session.chunks[data.chunkIndex] = binaryContent;
              session.receivedChunks++;

              // 发送确认
              socket.emit('chunk-received', {
                  filename: data.filename,
                  chunkIndex: data.chunkIndex
              });

          } catch (error:any) {
              socket.emit('upload-error', {
                  message: `Chunk upload failed: ${error.message}`
              });
          }
      });
        // 处理文件上传完成
        socket.on('upload-complete', async (data: { filename: string, totalSize: number }) => {
          try {
              const session = uploadSessions.get(data.filename);
              if (!session) {
                  throw new Error('Upload session not found');
              }

              // 合并所有分片
              const fileContent = Buffer.concat(session.chunks);

              // 验证文件大小
              if (fileContent.length !== data.totalSize) {
                  throw new Error('File size mismatch');
              }

              // 创建 SFTP 会话并写入文件
              const sftp = await new Promise((resolve, reject) => {
                  sshClient?.sftp((err, sftp) => {
                      if (err) reject(err);
                      else resolve(sftp);
                  });
              });

              // 写入文件
              await new Promise<void>((resolve, reject) => {
                  const writeStream = (sftp as any).createWriteStream(data.filename);
                  writeStream.on('error', reject);
                  writeStream.on('close', resolve);
                  writeStream.end(fileContent);
              });

              // 清理会话数据
              uploadSessions.delete(data.filename);

              // 立即发送成功消息
              socket.emit('upload-success', {
                  filename: data.filename,
                  size: fileContent.length
              });

              console.log(chalk.green(`File ${data.filename} uploaded successfully (${fileContent.length} bytes)`));

          } catch (error) {
              console.error(chalk.red('Upload complete error:'), error);
              socket.emit('upload-error', {
                  message: error instanceof Error ? error.message : 'Unknown error'
              });
          }
      });
    // 处理断开连接
    socket.on('ssh:disconnect', () => {
      if (sshClient) {
        sshClient.end();
        sshClient = null;
      }
    });

    // 处理 WebSocket 断开连接
    socket.on('disconnect', () => {
      console.log(chalk.yellow('Client disconnected'));
      if (sshClient) {
        sshClient.end();
        sshClient = null;
      }
    });

    // 处理文件下载请求
    socket.on('download-file', async (data: { filepath: string }) => {
        try {
            if (!sshClient) {
                throw new Error('SSH connection not found');
            }

            // 处理文件路径
            let filepath = data.filepath.trim();
            if (filepath.startsWith('~')) {
                filepath = filepath.replace('~', '/root');
            }
            if (!filepath.startsWith('/')) {
                filepath = `/root/${filepath}`;
            }

            console.log('Starting download for file:', filepath);

            const sftp = await new Promise((resolve, reject) => {
                sshClient?.sftp((err, sftp) => {
                    if (err) {
                        console.error('SFTP error:', err);
                        reject(err);
                    } else {
                        resolve(sftp);
                    }
                });
            });

            // 获取文件信息
            const stats = await new Promise((resolve, reject) => {
                (sftp as any).stat(filepath, (err: Error, stats: any) => {
                    if (err) {
                        console.error('File stat error:', err);
                        reject(new Error(`File not found: ${filepath}`));
                    } else if (!stats.isFile()) {
                        reject(new Error('Not a file'));
                    } else {
                        resolve(stats);
                    }
                });
            });

            // 减小分片大小到 256KB
            const CHUNK_SIZE = 5*1024 * 1024;
            const fileSize = (stats as any).size;
            const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

            console.log(`File size: ${fileSize} bytes, Total chunks: ${totalChunks}`);

            // 发送文件信息
            socket.emit('file-info', {
                filename: path.basename(filepath),
                size: fileSize,
                totalChunks
            });

            // 等待客户端准备就绪
            await new Promise<void>((resolve) => {
                socket.once('ready-to-receive', () => {
                    console.log('Client ready to receive');
                    resolve();
                });
            });

            // 分片读取并发送
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, fileSize);

                console.log(`Sending chunk ${i + 1}/${totalChunks} (${start}-${end})`);

                try {
                    // 读取分片
                    const chunk = await new Promise<Buffer>((resolve, reject) => {
                        const readStream = (sftp as any).createReadStream(filepath, {
                            start,
                            end: end - 1
                        });

                        const chunks: Buffer[] = [];
                        readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
                        readStream.on('end', () => resolve(Buffer.concat(chunks)));
                        readStream.on('error', (err: Error) => {
                            console.error(`Error reading chunk ${i}:`, err);
                            reject(err);
                        });
                    });

                    // 发送分片
                    await new Promise<void>((resolve, reject) => {
                        socket.emit('file-chunk', {
                            chunkIndex: i,
                            content: chunk.toString('base64'),
                            isLast: i === totalChunks - 1
                        });

                        // 等待确认
                        socket.once('chunk-received', () => {
                            console.log(`Chunk ${i + 1}/${totalChunks} confirmed`);
                            resolve();
                        });

                        // 添加超时处理
                        setTimeout(() => {
                            reject(new Error(`Chunk ${i} confirmation timeout`));
                        }, 10000);
                    });

                } catch (error) {
                    console.error(`Error processing chunk ${i}:`, error);
                    throw error;
                }
            }

            console.log(chalk.green(
                `File ${filepath} downloaded successfully (${fileSize} bytes)`
            ));

        } catch (error) {
            console.error(chalk.red('Download error:'), error);
            socket.emit('download-error', {
                message: error instanceof Error ? error.message : 'Download failed'
            });
        }
    });
  });

  // 启动服务器
  httpServer.listen(port, () => {
    console.log(chalk.green(`SSH WebSocket server running at http://localhost:${port}`));
    open(`http://localhost:${port}`);
  });

  // 错误处理
  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.log(chalk.yellow(`Port ${port} is in use, trying ${port + 1}`));
      startSSHServer(port + 1);
    } else {
      console.error(chalk.red('Server error:'), error);
    }
  });
}


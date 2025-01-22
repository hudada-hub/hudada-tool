import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { io, Socket } from 'socket.io-client';
import { SSHConnection, sshDB } from '../db/SSHDatabase';

export class SSHTerminal {
    private terminal!: Terminal;
    private fitAddon!: FitAddon;
    private socket!: Socket;
    private connection: SSHConnection;
    private container: HTMLElement;
    private isConnected = false;
    private commandBuffer = '';
    private historyIndex = -1;
    private history: string[] = [];
    private isProcessingKey = false;
    private isInitialized = false;
    private contextMenu: HTMLDivElement | null = null;

    constructor(connection: SSHConnection) {
        this.connection = connection;
        this.container = this.initContainer();
        this.initTerminal();
        this.initContextMenu();
    }

    private initContainer(): HTMLElement {
        const terminalContainer = document.getElementById('terminalContainer');
        const terminal = document.getElementById('terminal');

        if (!terminalContainer || !terminal) {
            throw new Error('Terminal container not found');
        }

        // 显示终端容器并设置样式
        terminalContainer.style.display = 'block';
        terminal.style.width = '100%';
        terminal.style.height = '100%';
        terminal.style.position = 'relative'; // 添加这行
        terminal.style.overflow = 'hidden';   // 添加这行

        // 清空容器
        terminal.innerHTML = '';

        return terminal;
    }

    private async uploadFile(file: File) {
        const chunkSize = 64 * 1024; // 64KB 分片
        const totalChunks = Math.ceil(file.size / chunkSize);
        let uploadedSize = 0;

        try {
            this.terminal?.writeln(`\r\n\x1b[36m开始上传文件: ${file.name} (${this.formatFileSize(file.size)})\x1b[0m`);

            // 发送上传开始事件
            this.socket?.emit('upload-start', {
                filename: file.name,
                size: file.size,
                totalChunks
            });

            // 等待服务器确认开始
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('上传初始化超时'));
                }, 5000);

                const handleStart = () => {
                    clearTimeout(timeout);
                    resolve();
                };

                this.socket?.once('upload-started', handleStart);
            });

            // 上传分片
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);

                // 使用 ArrayBuffer 读取文件内容
                const chunkContent = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        // 将 ArrayBuffer 转换为 Base64 字符串
                        const arrayBuffer = reader.result as ArrayBuffer;
                        const base64String = btoa(
                            new Uint8Array(arrayBuffer)
                                .reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        resolve(base64String);
                    };
                    reader.onerror = () => reject(reader.error);
                    reader.readAsArrayBuffer(chunk);
                });

                // 发送分片
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`分片 ${chunkIndex + 1}/${totalChunks} 上传超时`));
                    }, 10000);

                    const handleChunkConfirm = (response: any) => {
                        if (response.chunkIndex === chunkIndex) {
                            clearTimeout(timeout);
                            this.socket?.off('chunk-received', handleChunkConfirm);
                            this.socket?.off('upload-error', handleError);
                            resolve();
                        }
                    };

                    const handleError = (error: any) => {
                        clearTimeout(timeout);
                        this.socket?.off('chunk-received', handleChunkConfirm);
                        this.socket?.off('upload-error', handleError);
                        reject(new Error(error.message));
                    };

                    this.socket?.on('chunk-received', handleChunkConfirm);
                    this.socket?.on('upload-error', handleError);

                    this.socket?.emit('upload-chunk', {
                        filename: file.name,
                        content: chunkContent,
                        chunkIndex,
                        totalChunks,
                        size: chunk.size
                    });
                });

                // 更新进度
                uploadedSize += chunk.size;
                const progress = Math.round((uploadedSize / file.size) * 100);
                this.terminal?.write(`\r\x1b[2K`);
                this.terminal?.write(
                    `\x1b[36m上传进度: ${progress}% [${this.getProgressBar(progress)}] ${this.formatFileSize(uploadedSize)}/${this.formatFileSize(file.size)}\x1b[0m`
                );
            }

            // 发送上传完成消息并等待成功响应
            await new Promise<void>((resolve, reject) => {
                const handleSuccess = (response: { filename: string; size: number }) => {
                    if (response.filename === file.name) {
                        this.socket?.off('upload-success', handleSuccess);
                        this.socket?.off('upload-error', handleError);
                        this.socket?.off('disconnect', handleDisconnect);

                        // 清除进度条并显示成功消息
                        this.terminal?.write(`\r\x1b[2K`);
                        this.terminal?.writeln(
                            `\r\n\x1b[32m文件 ${file.name} 上传成功 (${this.formatFileSize(response.size)})\x1b[0m`
                        );
                        resolve();
                    }
                };

                const handleError = (error: any) => {
                    this.socket?.off('upload-success', handleSuccess);
                    this.socket?.off('upload-error', handleError);
                    this.socket?.off('disconnect', handleDisconnect);
                    reject(new Error(error.message || '上传失败'));
                };

                const handleDisconnect = () => {
                    this.socket?.off('upload-success', handleSuccess);
                    this.socket?.off('upload-error', handleError);
                    this.socket?.off('disconnect', handleDisconnect);
                    reject(new Error('连接断开'));
                };

                // 注册事件监听
                this.socket?.on('upload-success', handleSuccess);
                this.socket?.on('upload-error', handleError);
                this.socket?.on('disconnect', handleDisconnect);

                // 发送完成消息
                this.socket?.emit('upload-complete', {
                    filename: file.name,
                    totalSize: file.size
                });
            });

        } catch (error: any) {
            this.terminal?.writeln(`\r\n\x1b[31m上传失败: ${error.message}\x1b[0m`);
            throw error;
        }
    }

    private getProgressBar(percent: number): string {
        const width = 20;
        const filled = Math.round(width * percent / 100);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    private formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    private initDragAndDrop() {
        if (!this.container) return;

        this.container.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.add('dragging');
        });

        this.container.addEventListener('dragleave', (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragging');
        });

        this.container.addEventListener('drop', async (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragging');

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            for (const file of files) {
                try {
                    await this.uploadFile(file);
                } catch (error) {
                    // 错误已在 uploadFile 中处理
                    continue;
                }
            }
        });
    }

    private initTerminal() {
        // 创建终端实例
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
            },
            allowTransparency: true,
            scrollback: 1000,
            rows: 24,
            cols: 80
        });

        // 创建并加载插件
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        this.terminal.loadAddon(new WebLinksAddon());

        // 打开终端
        try {
            this.terminal.open(this.container);

            // 调整大小
            requestAnimationFrame(() => {
                if (this.fitAddon && this.container.offsetWidth > 0 && this.container.offsetHeight > 0) {
                    this.fitAddon.fit();
                }
            });

            this.isInitialized = true;
            this.initDragAndDrop();
            this.loadHistory();
            this.bindEvents();
        } catch (error) {
            console.error('Terminal open error:', error);
            throw error;
        }
    }

    private async loadHistory() {
        try {
            if (!this.connection.id) return;

            const histories = await sshDB.getHistory(this.connection.id);
            this.history = histories.map(h => h.command);
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }

    private bindEvents() {
        // 绑定终端输入
        this.terminal.onData(data => {
            if (this.isConnected && this.socket) {
                this.socket.emit('ssh:data', data);
            }
        });

        // 绑定窗口大小改变
        window.addEventListener('resize', () => {
            this.fit();
        });

        // 绑定关闭按钮
        const closeBtn = document.getElementById('closeTerminal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.disconnect();
                const container = document.getElementById('terminalContainer');
                if (container) {
                    container.style.display = 'none';
                }
            });
        }

        // 处理键盘事件
        this.terminal.onKey(({ key, domEvent }) => {
            if (this.isProcessingKey) return;
            this.isProcessingKey = true;

            try {
                const ev = domEvent as KeyboardEvent;

                switch (true) {
                    // 回车键：执行命令
                    case key === '\r': {
                        if (this.commandBuffer.trim()) {
                            this.addToHistory(this.commandBuffer);
                            this.historyIndex = -1;
                        }
                        this.commandBuffer = '';
                        break;
                    }

                    // 向上键：历史记录向前
                    case ev.key === 'ArrowUp': {
                        ev.preventDefault();
                        if (this.historyIndex < this.history.length - 1) {
                            this.historyIndex++;
                            this.setCommand(this.history[this.historyIndex]);
                        }
                        break;
                    }

                    // 向下键：历史记录向后
                    case ev.key === 'ArrowDown': {
                        ev.preventDefault();
                        if (this.historyIndex > -1) {
                            this.historyIndex--;
                            this.setCommand(
                                this.historyIndex === -1 ? '' : this.history[this.historyIndex]
                            );
                        }
                        break;
                    }

                    // Ctrl+R：搜索历史记录
                    case ev.ctrlKey && ev.key === 'r': {
                        ev.preventDefault();
                        this.searchHistory();
                        break;
                    }

                    // Ctrl+L：清屏
                    case ev.ctrlKey && ev.key === 'l': {
                        ev.preventDefault();
                        this.terminal.clear();
                        break;
                    }

                    // 其他按键：更新命令缓冲
                    default: {
                        if (key.length === 1) {
                            this.commandBuffer += key;
                        } else if (key === '\x7f') { // Backspace
                            this.commandBuffer = this.commandBuffer.slice(0, -1);
                        }
                    }
                }
            } finally {
                this.isProcessingKey = false;
            }
        });
    }

    private async addToHistory(command: string) {
        try {
            if (!this.connection.id) return;

            // 添加到内存中的历史记录
            this.history.unshift(command);
            if (this.history.length > 100) {
                this.history.pop();
            }

            // 保存到数据库
            await sshDB.addHistory({
                connectionId: this.connection.id,
                command,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    private setCommand(command: string) {
        // 清除当前行
        this.terminal.write('\x1b[2K\r');
        // 重写提示符和命令
        this.terminal.write('$ ' + command);
        this.commandBuffer = command;
    }

    private async searchHistory() {
        const searchTerm = prompt('搜索历史记录:');
        if (!searchTerm) return;

        const matches = this.history.filter(cmd =>
            cmd.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matches.length > 0) {
            this.terminal.writeln('\r\n搜索结果:');
            matches.forEach((cmd, i) => {
                this.terminal.writeln(`${i + 1}: ${cmd}`);
            });

            const selection = prompt('选择命令编号 (1-' + matches.length + '):');
            if (selection) {
                const index = parseInt(selection) - 1;
                if (index >= 0 && index < matches.length) {
                    this.setCommand(matches[index]);
                }
            }
        } else {
            this.terminal.writeln('\r\n未找到匹配的命令');
        }
    }

    public async clearHistory() {
        try {
            if (!this.connection.id) return;

            await sshDB.clearHistory(this.connection.id);
            this.history = [];
            this.historyIndex = -1;
            this.terminal.writeln('历史记录已清除');
        } catch (error) {
            console.error('清除历史记录失败:', error);
            this.terminal.writeln('清除历史记录失败');
        }
    }

    public async connect() {
        if (!this.terminal || !this.fitAddon) {
            throw new Error('Terminal not initialized');
        }

        try {
            // 连接 WebSocket
            this.socket = io('http://localhost:669', {
                transports: ['websocket']
            });

            // 绑定 Socket 事件
            this.socket.on('connect', () => {
                this.terminal.writeln('正在连接到服务器...');
                console.log('this.connection', this.connection);

                this.socket?.emit('ssh:connect', {
                    host: this.connection.host,
                    port: this.connection.port,
                    username: this.connection.username,
                    password: this.connection.password
                });
            });

            this.socket.on('ssh:ready', () => {
                this.isConnected = true;
                this.terminal.clear();
                this.terminal.writeln('连接成功！');

                // 发送终端大小
                const { rows, cols } = this.terminal;
                this.socket?.emit('ssh:resize', { rows, cols });
            });

            this.socket.on('ssh:data', (data: string) => {
                this.terminal.write(data);
            });

            this.socket.on('ssh:error', (error: string) => {
                this.terminal.writeln(`\r\n\x1b[31m错误: ${error}\x1b[0m`);
                this.disconnect();
            });

            this.socket.on('ssh:close', () => {
                this.terminal.writeln('\r\n\x1b[33m连接已关闭\x1b[0m');
                this.disconnect();
            });

            this.socket.on('disconnect', () => {
                this.terminal.writeln('\r\n\x1b[31m与服务器断开连接\x1b[0m');
                this.disconnect();
            });
            // 确保终端大小正确
            requestAnimationFrame(() => {
                this.fit();
            });

        } catch (error) {
            console.error('终端初始化失败:', error);
            this.terminal.writeln(`\r\n\x1b[31m终端初始化失败: ${error}\x1b[0m`);
        }
    }

    public fit() {
        if (!this.fitAddon || !this.terminal) return;

        requestAnimationFrame(() => {
            try {
                if (this.container.offsetWidth > 0 && this.container.offsetHeight > 0) {
                    this.fitAddon.fit();
                    if (this.isConnected && this.socket) {
                        const { rows, cols } = this.terminal;
                        this.socket.emit('ssh:resize', { rows, cols });
                    }
                }
            } catch (error) {
                console.error('Fit error:', error);
            }
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.emit('ssh:disconnect');
            this.socket.disconnect();
        }
        this.isConnected = false;
    }

    public destroy() {
        this.disconnect();
        if (this.terminal) {
            this.terminal.dispose();
        }

        this.isInitialized = false;
    }

    private initContextMenu() {
        // 创建右键菜单
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'ssh-context-menu';
        this.contextMenu.style.display = 'none';
        document.body.appendChild(this.contextMenu);

        // 监听终端选择事件
        this.terminal?.element?.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button === 2) { // 右键点击
                const selection = this.terminal?.getSelection();
                if (selection && selection.trim()) {
                    e.preventDefault();
                    this.showContextMenu(e.pageX, e.pageY, selection);
                }
            }
        });

        // 点击其他地方时隐藏菜单
        document.addEventListener('click', (e: MouseEvent) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target as Node)) {
                this.contextMenu.style.display = 'none';
            }
        });

        // 阻止终端默认右键菜单
        this.terminal?.element?.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
        });
    }

    private showContextMenu(x: number, y: number, selection: string) {
        if (!this.contextMenu) return;

        // 清理旧的菜单项
        this.contextMenu.innerHTML = '';

        // 创建下载按钮
        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'context-menu-item download';
        downloadBtn.textContent = '下载文件';
        downloadBtn.onclick = (e) => {
            e.stopPropagation();
            this.downloadFile(selection.trim());
            this.contextMenu!.style.display = 'none';
        };
        this.contextMenu.appendChild(downloadBtn);

        // 调整菜单位置，确保不超出视窗
        const rect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let left = x;
        let top = y;

        if (x + rect.width > windowWidth) {
            left = windowWidth - rect.width;
        }

        if (y + rect.height > windowHeight) {
            top = windowHeight - rect.height;
        }

        this.contextMenu.style.left = `${left}px`;
        this.contextMenu.style.top = `${top}px`;
        this.contextMenu.style.display = 'block';
    }

    private async downloadFile(filepath: string) {
        try {
            this.terminal?.writeln(`\r\n\x1b[36m开始下载文件: ${filepath}\x1b[0m`);
            console.log('Starting download for:', filepath);

            const chunks: Uint8Array[] = [];
            let filename: string;
            let totalSize: number;


              // 等待文件信息
        const fileInfo = await new Promise<any>((resolve, reject) => {
            const handleFileInfo = (info: any) => {
                console.log('Received file info:', info);
                this.socket?.off('file-info', handleFileInfo);
                this.socket?.off('download-error', handleError);
                resolve(info);
            };

            const handleError = (error: any) => {
                this.socket?.off('file-info', handleFileInfo);
                this.socket?.off('download-error', handleError);
                reject(new Error(error.message));
            };

            this.socket?.on('file-info', handleFileInfo);
            this.socket?.on('download-error', handleError);

            this.socket?.emit('download-file', {
                filepath: filepath.trim()
            });
        });

            filename = fileInfo.filename;
            totalSize = fileInfo.size;
            let receivedSize = 0;

            console.log(`File info received: ${filename}, size: ${totalSize}`);


            // 通知服务器开始发送
            this.socket?.emit('ready-to-receive');

            // 接收分片
                // 接收分片
        const handleChunk = (chunk: any) => {
            return new Promise<void>((resolve, reject) => {
                try {
                    console.log(`Receiving chunk ${chunk.chunkIndex}`);

                    // 转换分片数据
                    const byteCharacters = atob(chunk.content);
                    const byteArray = new Uint8Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteArray[i] = byteCharacters.charCodeAt(i);
                    }

                    chunks.push(byteArray);
                    receivedSize += byteArray.length;

                    // 更新进度
                    const progress = Math.round((receivedSize / totalSize) * 100);
                    this.terminal?.write(`\r\x1b[2K`);
                    this.terminal?.write(
                        `\x1b[36m下载进度: ${progress}% [${this.getProgressBar(progress)}] ${this.formatFileSize(receivedSize)}/${this.formatFileSize(totalSize)}\x1b[0m`
                    );

                    // 确认接收
                    this.socket?.emit('chunk-received');
                    console.log(`Chunk ${chunk.chunkIndex} processed`);

                    resolve();
                } catch (error) {
                    console.error('Error processing chunk:', error);
                    reject(error);
                }
            });
        };
     // 设置分片接收处理
     this.socket?.on('file-chunk', handleChunk);

     // 等待所有分片接收完成
     await new Promise<void>((resolve, reject) => {
         const checkComplete = () => {
             if (receivedSize >= totalSize) {
                 this.socket?.off('file-chunk', handleChunk);
                 resolve();
             }
         };

         const handleError = (error: any) => {
             this.socket?.off('file-chunk', handleChunk);
             reject(new Error(error.message));
         };

         this.socket?.on('download-error', handleError);

         // 定期检查是否完成
         const interval = setInterval(() => {
             checkComplete();
             if (receivedSize >= totalSize) {
                 clearInterval(interval);
             }
         }, 100);
     });
   console.log('All chunks received, creating blob');
   // 合并所有分片
   const blob = new Blob(chunks, { type: 'application/octet-stream' });

   // 创建下载链接
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   a.style.display = 'none';
   document.body.appendChild(a);
   a.click();

   // 清理
   setTimeout(() => {
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
   }, 100);

   this.terminal?.writeln(
       `\r\n\x1b[32m文件下载成功: ${filename} (${this.formatFileSize(totalSize)})\x1b[0m`
   );




        } catch (error: any) {
            console.error('Download error:', error);
            this.terminal?.writeln(`\r\n\x1b[31m下载失败: ${error.message}\x1b[0m`);
        }
    }
}

// 初始化终端的工厂函数
let currentTerminal: SSHTerminal | null = null;

export async function initTerminal(connection: SSHConnection) {
    // 如果已有终端，先销毁
    if (currentTerminal) {
        currentTerminal.destroy();
    }

    // 创建新终端
    currentTerminal = new SSHTerminal(connection);
    await currentTerminal.connect();
    return currentTerminal;
}
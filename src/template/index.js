// 获取服务器端渲染的文件结构
const fileStructure = {{ fileStructure }};


const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');

// 文件按钮点击处理
function handleFileButtonClick(event) {
    event.stopPropagation(); // 阻止事件冒泡
    fileInput.click();  // 使用普通文件选择
}

// 文件夹按钮点击处理
function handleFolderButtonClick(event) {
    event.stopPropagation(); // 阻止事件冒泡
    folderInput.click();  // 使用文件夹选择
}

// 添加文件浏览相关代码
// 添加按钮点击事件处理
document.addEventListener('DOMContentLoaded', function () {
    // 文件上传处理
    fileInput.addEventListener('change', function (e) {
        e.stopPropagation();
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // 文件夹上传处理
    folderInput.addEventListener('change', function (e) {
        e.stopPropagation();
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleFiles(files);
        }
    });
});

// 防止文件输入框的点击事件冒泡
fileInput.addEventListener('click', function (e) {
    e.stopPropagation();
});

// 防止文件夹输入框的点击事件冒泡
folderInput.addEventListener('click', function (e) {
    e.stopPropagation();
});

// 更新拖放区域的提示文本
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('drag-over');
    const items = e.dataTransfer?.items;
    if (items && items.length > 0) {
        if (items[0].webkitGetAsEntry()?.isDirectory) {
            this.querySelector('.upload-text').textContent = '释放以上传文件夹';
        } else {
            this.querySelector('.upload-text').textContent = '释放以上传文件';
        }
    }
});

dropZone.addEventListener('dragleave', function () {
    this.classList.remove('drag-over');
    this.querySelector('.upload-text').textContent = '拖放文件到这里或点击选择文件';
});
const folderStructureEl = document.getElementById('folderStructure');
function getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons = {
        pdf: '📄',
        doc: '📄',
        docx: '📄',
        xls: '📊',
        xlsx: '📊',
        txt: '📝',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        gif: '🖼️',
        mp3: '🎵',
        mp4: '🎥',
        zip: '📦',
        rar: '📦',
        default: '📄'
    };
    return icons[ext] || icons.default;
}

// 添加当前路径状态
let currentPath = '';

// 添加面包屑导航渲染函数
function renderBreadcrumb() {
    const container = document.createElement('div');
    container.className = 'breadcrumb';

    const paths = currentPath.split('/').filter(Boolean);
    let html = `<span class="breadcrumb-item" onclick="navigateTo('')">根目录</span>`;

    let currentPathBuild = '';
    paths.forEach(path => {
        currentPathBuild += '/' + path;
        html += `
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item" onclick="navigateTo('${currentPathBuild}')">${path}</span>
        `;
    });

    container.innerHTML = html;
    return container;
}

// 添加导航函数
function navigateTo(path) {
    currentPath = path;
    renderFileTable(filterFilesByPath(fileStructure, path));
}

// 过滤指定路径的文件
function filterFilesByPath(files, path) {
    if (!path) return files;

    const paths = path.split('/').filter(Boolean);
    let currentFiles = files;

    for (const p of paths) {
        const folder = currentFiles.find(f => f.type === 'directory' && f.name === p);
        if (folder) {
            currentFiles = folder.items;
        } else {
            return [];
        }
    }

    return currentFiles;
}

// 修改文件表格渲染函数
function renderFileTable(files) {
    const container = document.getElementById('fileTableContainer');

    // 添加面包屑导航
    container.innerHTML = '';
    container.appendChild(renderBreadcrumb());

    if (!files || files.length === 0) {
        container.innerHTML += '<div class="empty-message">暂无文件</div>';
        return;
    }

    let html = `
        <table class="file-table">
            <thead>
                <tr>
                    <th>文件名</th>
                    <th>大小</th>
                    <th>修改时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    console.log(files,'files');


    files.forEach(item => {
        const icon = item.type === 'directory' ? '📁' : getFileIcon(item.name);
        const size = item.type === 'directory' ? '-' : formatFileSize(item.size);
        const onClick = item.type === 'directory'
            ? `onclick="navigateTo('${currentPath}/${item.name}')"`
            : '';



            html += `
            <tr>
                <td>
                    <div class="file-name" ${onClick}>
                        <span class="file-icon">${icon}</span>
                        ${item.name}
                    </div>
                </td>
                <td>${size}</td>
                <td>${item.mtime}</td>
                <td class="action-column">
                    ${item.type === 'directory'
                        ? `<button class="download-btn" onclick="downloadFolder('${item.path}')">
                             <span class="btn-icon">📥</span>下载
                           </button>`
                        : `<a class="download-btn" href="/uploads/${item.path}" download>
                             <span class="btn-icon">📥</span>下载
                           </a>`
                    }
                    <button class="delete-btn" onclick="deleteFile('${item.path}')">
                        <span class="btn-icon">🗑️</span>删除
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML += html;
}



// 初始化渲染
document.addEventListener('DOMContentLoaded', () => {
    renderFileTable(fileStructure);
});

// 删除文件或文件夹
async function deleteFile(path) {
    if (!confirm('确定要删除这个文件/文件夹吗？')) {
        return;
    }

    try {
        const response = await fetch(`/delete?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('删除失败，请重试');
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
    }
}

// 如果没有文件，显示提示信息
if (!fileStructure || fileStructure.length === 0) {
    folderStructureEl.innerHTML = '<div style="text-align: center; color: #666;">暂无文件</div>';
} else {
    folderStructureEl.innerHTML = renderFolder(fileStructure);
}
const fileList = document.getElementById('fileList');
const uploadProgress = document.getElementById('uploadProgress');
// 点击上传区域触发文件选择
dropZone.addEventListener('click', () => {
    // 如果点击的是上传区域本身（不是按钮），则默认触发文件选择
    if (e.target === this || e.target.classList.contains('upload-area') ||
        e.target.classList.contains('upload-icon') || e.target.classList.contains('upload-text')) {
        fileInput.click();
    }
});
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    // 处理拖拽的文件和文件夹
    const items = Array.from(e.dataTransfer.items);
    for (const item of items) {
        if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                await handleEntry(entry);
            }
        }
    }
});
// 上传单个文件
async function uploadFile(file) {
    // 创建进度条元素
    const progressItem = document.createElement('div');
    progressItem.className = 'progress-item';
    progressItem.innerHTML = `
    <div class="progress-header">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
    </div>
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
`;
    uploadProgress.appendChild(progressItem);

    const progressFill = progressItem.querySelector('.progress-fill');

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            progressFill.style.width = '100%';
            progressFill.style.backgroundColor = '#4caf50';

            // 上传成功后延迟刷新页面
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error(data.message || '上传失败');
        }
    } catch (error) {
        console.error('上传错误:', error);
        progressFill.style.backgroundColor = '#f44336';
        progressItem.innerHTML += `
        <div class="error-message">
            上传失败: ${error.message}
        </div>
    `;
    }
}
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

// 处理文件系统入口
async function handleEntry(entry, path = '') {
    if (entry.isFile) {
        const file = await getFileFromEntry(entry);
        await uploadFile(file, path);
    } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await readEntriesPromise(dirReader);
        const dirPath = path ? path + '/' + entry.name : entry.name;

        // 创建文件夹显示
        const folderItem = document.createElement('div');
        folderItem.className = 'file-item';
        folderItem.innerHTML = `
                    <div>
                        <div>📁 ${dirPath} <span class="folder-info">文件夹</span></div>
                        <div class="folder-structure"></div>
                    </div>
                `;
        fileList.appendChild(folderItem);

        // 递归处理文件夹内容
        for (const childEntry of entries) {
            await handleEntry(childEntry, dirPath);
        }
    }
}

// 将 FileEntry 转换为 File 对象
function getFileFromEntry(entry) {
    return new Promise((resolve) => {
        entry.file(resolve);
    });
}

// 读取目录内容
function readEntriesPromise(dirReader) {
    return new Promise((resolve) => {
        const entries = [];
        function readEntries() {
            dirReader.readEntries((results) => {
                if (results.length === 0) {
                    resolve(entries);
                } else {
                    entries.push(...results);
                    readEntries();
                }
            });
        }
        readEntries();
    });
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        const path = file.webkitRelativePath || '';
        uploadFile(file, path);
    });
}

// 更新下载文件夹函数
async function downloadFolder(folderPath) {
    try {
        // 显示下载进度提示
        const notification = document.createElement('div');
        notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 1000;
            `;
        notification.textContent = '正在准备下载...';
        document.body.appendChild(notification);

        const response = await fetch(`/download-folder?path=${encodeURIComponent(folderPath)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 获取文件名
        const contentDisposition = response.headers.get('content-disposition');
        let filename = folderPath.split('/').pop() + '.zip';
        if (contentDisposition) {
            const matches = contentDisposition.match(/filename="(.+)"/);
            if (matches) {
                filename = decodeURIComponent(matches[1]);
            }
        }

        // 创建下载流
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        notification.textContent = '下载完成！';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);

    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

// 添加文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile(file, path = '') {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const relativePath = path ? `${path}/${file.name}` : file.name;

    fileItem.innerHTML = `
                <div>
                    <div>📄 ${relativePath}</div>
                    <div class="progress">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="upload-info">${formatFileSize(file.size)}</div>
                </div>
            `;
    fileList.appendChild(fileItem);

    const progressBar = fileItem.querySelector('.progress-bar');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            progressBar.style.width = '100%';
            progressBar.style.background = '#4caf50';
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            progressBar.style.background = '#f44336';
        }
    } catch (error) {
        console.error('Error:', error);
        progressBar.style.background = '#f44336';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}




function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加计算文件夹大小的函数
function calculateFolderSize(items) {
    let totalSize = 0;
    items.forEach(item => {
        if (item.type === 'directory') {
            totalSize += calculateFolderSize(item.items);
        } else {
            totalSize += item.size;
        }
    });
    return totalSize;
}

// 修改 renderFolder 函数
function renderFolder(items, level = 0) {
    let html = '';
    items.forEach(item => {
        if (item.type === 'directory') {
            const folderSize = calculateFolderSize(item.items);
            html += `
                <div class="folder-item" data-path="${item.path}">
                    <div class="folder-header">
                        <div>
                            <span class="folder-icon">📁</span>
                            ${item.name}
                            <span class="size-info">${formatFileSize(folderSize)}</span>
                        </div>
                        <div class="folder-actions">
                            <button class="download-folder" onclick="downloadFolder('${item.path}')">
                                <span class="btn-icon">📥</span>下载
                            </button>
                            <button class="delete-btn" onclick="deleteFile('${item.path}')">
                                <span class="btn-icon">🗑️</span>删除
                            </button>
                        </div>
                    </div>
                    <div class="folder-content">
                        ${renderFolder(item.items, level + 1)}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="folder-item">
                    <div class="file-header">
                        <div>
                            <span class="file-icon">${getFileIcon(item.name)}</span>
                            ${item.name}
                            <span class="size-info">${formatFileSize(item.size)}</span>
                        </div>
                        <div class="file-actions">
                            <a class="download-btn" href="/uploads/${item.path}" download>
                                <span class="btn-icon">📥</span>下载
                            </a>
                            <button class="delete-btn" onclick="deleteFile('${item.path}')">
                                <span class="btn-icon">🗑️</span>删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    return html;
}

// 添加新的样式
const style = document.createElement('style');
style.textContent += `
    .folder-header, .file-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
    }

    .folder-header:hover, .file-header:hover {
        background-color: #f5f5f5;
    }

    .folder-actions, .file-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .size-info {
        color: #666;
        font-size: 0.9em;
        margin-left: 8px;
    }

    .folder-icon, .file-icon {
        margin-right: 8px;
    }

    @media (max-width: 768px) {
        .folder-header, .file-header {
            flex-direction: column;
            gap: 8px;
        }

        .folder-actions, .file-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
`;

document.head.appendChild(style);

// 渲染文件结构
folderStructureEl.innerHTML = folderStructure.length > 0
    ? renderFolder(folderStructure)
    : '<div style="text-align: center; color: #666;">暂无文件</div>';

// 文件夹点击展开/收起
folderStructureEl.addEventListener('click', (e) => {
    const folderItem = e.target.closest('.folder-item');
    if (folderItem && !e.target.closest('.download-folder')) {
        const content = folderItem.querySelector('.folder-content');
        if (content) {
            content.classList.toggle('open');
        }
    }
});

// 下载文件夹
async function downloadFolder(folderPath) {
    try {
        const response = await fetch(`/download-folder?path=${encodeURIComponent(folderPath)}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = folderPath.split('/').pop() + '.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

import { SSHConnection, sshDB } from '../db/SSHDatabase';
import { initTerminal } from './SSHTerminal';

export class SSHTable {
    private tableBody: HTMLElement;
    private connections: SSHConnection[] = [];

    constructor() {
        this.tableBody = document.getElementById('sshTableBody') as HTMLElement;
        this.init();
    }

    private async init() {
        // 初始化数据库
        await sshDB.init();
        // 加载连接列表
        await this.loadConnections();
        // 绑定事件
        this.bindEvents();
    }

    private async loadConnections() {
        try {
            this.connections = await sshDB.getAllConnections();
            this.renderTable();
        } catch (error) {
            console.error('加载连接列表失败:', error);
            alert('加载连接列表失败');
        }
    }

    private renderTable() {
        this.tableBody.innerHTML = this.connections.length ?
            this.connections.map(conn => this.createTableRow(conn)).join('') :
            '<tr><td colspan="6" class="empty-message">暂无连接，请添加新连接</td></tr>';
    }

    private createTableRow(connection: SSHConnection): string {
        const { id, name, host, port, username, description = '' } = connection;
        return `
            <tr data-id="${id}">
                <td>${this.escapeHtml(name)}</td>
                <td>${this.escapeHtml(host)}</td>
                <td>${port}</td>
                <td>${this.escapeHtml(username)}</td>
                <td>${this.escapeHtml(description)}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm connect-btn" data-id="${id}">
                        连接
                    </button>
                    <button class="btn btn-secondary btn-sm edit-btn" data-id="${id}">
                        编辑
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${id}">
                        删除
                    </button>
                </td>
            </tr>
        `;
    }

    private escapeHtml(str: string): string {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    private bindEvents() {
        // 代理表格点击事件
        this.tableBody.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const id = Number(target.dataset.id);

            if (!id) return;

            const connection = this.connections.find(conn => conn.id === id);
            if (!connection) return;

            if (target.classList.contains('connect-btn')) {
                await this.handleConnect(connection);
            } else if (target.classList.contains('edit-btn')) {
                this.handleEdit(connection);
            } else if (target.classList.contains('delete-btn')) {
                await this.handleDelete(id);
            }
        });

        // 添加新连接按钮
        const addNewBtn = document.getElementById('addNewBtn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                this.showModal();
            });
        }
    }

    private async handleConnect(connection: SSHConnection) {
        try {
            // 显示终端容器
            const terminalContainer = document.getElementById('terminalContainer');
            if (terminalContainer) {
                terminalContainer.style.display = 'block';
            }

            // 设置终端标题
            const terminalTitle = document.getElementById('terminalTitle');
            if (terminalTitle) {
                terminalTitle.textContent = `${connection.name} - ${connection.host}`;
            }

            // 初始化终端
            await initTerminal(connection);

        } catch (error) {
            console.error('连接失败:', error);
            alert('连接失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    }

    private handleEdit(connection: SSHConnection) {
        // 显示编辑模态框
        this.showModal(connection);
    }

    private async handleDelete(id: number) {
        if (!confirm('确定要删除这个连接吗？')) return;

        try {
            await sshDB.deleteConnection(id);
            await this.loadConnections();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败');
        }
    }

     showModal(connection?: SSHConnection) {
        const modal = document.getElementById('sshModal');
        const form = document.getElementById('sshForm') as HTMLFormElement;
        const modalTitle = document.getElementById('modalTitle');

        if (!modal || !form || !modalTitle) return;

        // 设置模态框标题
        modalTitle.textContent = connection ? '编辑 SSH 连接' : '添加 SSH 连接';

        // 填充表单
        if (connection) {
            Object.entries(connection).forEach(([key, value]) => {
                const input = form.elements.namedItem(key) as HTMLInputElement;
                if (input) {
                    input.value = value.toString();
                }
            });
        } else {
            form.reset();
        }

        // 显示模态框
        modal.style.display = 'block';

        // 绑定保存按钮
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                await this.handleSave(form, connection?.id);
                modal.style.display = 'none';
            };
        }

        // 绑定关闭按钮
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.onclick = () => {
                    modal.style.display = 'none';
                };
            }
        });
    }

    private async handleSave(form: HTMLFormElement, id?: number) {
        const formData = new FormData(form);
        const connection: SSHConnection = {
            name: formData.get('name') as string,
            host: formData.get('host') as string,
            port: Number(formData.get('port')),
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            description: formData.get('description') as string
        };

        try {
            if (id) {
                // 更新连接
                await sshDB.updateConnection({ ...connection, id });
            } else {
                // 添加新连接
                await sshDB.addConnection(connection);
            }
            await this.loadConnections();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败');
        }
    }

    // 刷新表格
    public async refresh() {
        await this.loadConnections();
    }
}

// 初始化表格
document.addEventListener('DOMContentLoaded', () => {
    new SSHTable();
});
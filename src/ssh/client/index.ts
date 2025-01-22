
import { SSHTable } from './components/SSHTable';
import 'xterm/css/xterm.css';
import './styles/index.css';
import { SSHTerminal } from './components/SSHTerminal';
import { sshDB } from './db';  // 修改这里，使用 index.ts
declare global {
    interface Window {
        Terminal: any;
        FitAddon: any;
        io: any;
        currentTerminal?: SSHTerminal;
    }
}
// // 声明全局类型
// declare global {
//     interface Window {
//         Terminal: {
//             new(options?: any): Terminal;
//         };
//         FitAddon: {
//             new(): FitAddon;
//         };
//         io: {
//             (url: string, options?: any): Socket;
//         };
//         currentTerminal?: SSHTerminal;
//     }
// }
// 初始化数据库
sshDB.init().then(() => {
    // 初始化 SSH 连接表格
    const sshTable = new SSHTable();
    console.log('sshTable',sshTable);

    // 绑定添加新连接按钮
    const addNewBtn = document.getElementById('addNewBtn');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            console.log('addNewBtn');

            sshTable.showModal();
        });
    }

    // 绑定模态框关闭按钮
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('sshModal');

    [closeModal, cancelBtn].forEach(btn => {
        if (btn && modal) {
            btn.onclick = () => {
                modal.style.display = 'none';
            };
        }
    });

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 绑定终端关闭按钮
    const closeTerminal = document.getElementById('closeTerminal');
    const terminalContainer = document.getElementById('terminalContainer');
    if (closeTerminal && terminalContainer) {
        closeTerminal.onclick = () => {
            terminalContainer.style.display = 'none';
            // 关闭当前终端连接
            const terminal = window.currentTerminal;
            if (terminal) {
                terminal.disconnect();
            }
        };
    }

    // 窗口大小改变时调整终端大小
    window.addEventListener('resize', () => {
        const terminal = window.currentTerminal;
        if (terminal) {
            terminal.fit();
        }
    });
}).catch(error => {
    console.error('初始化失败:', error);
});


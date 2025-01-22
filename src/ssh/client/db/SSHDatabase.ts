export type SSHConnection ={
    id?: number;
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    description?: string;
  }
// 终端历史记录接口
export interface TerminalHistory {
  id?: number;
  connectionId: number;
  command: string;
  timestamp: number;
  output?: string;    // 可选：命令输出
  exitCode?: number;  // 可选：命令退出码
  duration?: number;  // 可选：命令执行时长(ms)
}

// SSH配置接口
export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

// 终端大小接口
export interface TerminalSize {
  rows: number;
  cols: number;
}
export  class SSHDatabase {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'ssh_connections';
    private readonly STORE_NAME = 'connections';
    private readonly HISTORY_STORE = 'terminal_history';
    async init(): Promise<void> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 创建连接存储
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
              db.createObjectStore(this.STORE_NAME, {
                  keyPath: 'id',
                  autoIncrement: true,
              });
          }

          // 创建历史记录存储
          if (!db.objectStoreNames.contains(this.HISTORY_STORE)) {
              const historyStore = db.createObjectStore(this.HISTORY_STORE, {
                  keyPath: 'id',
                  autoIncrement: true,
              });
              historyStore.createIndex('connectionId', 'connectionId');
              historyStore.createIndex('timestamp', 'timestamp');
          }
      };
      });
    }



    // 获取连接的历史记录
    async getHistory(connectionId: number, limit = 100): Promise<TerminalHistory[]> {
      if (!this.db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([this.HISTORY_STORE], 'readonly');
          const store = transaction.objectStore(this.HISTORY_STORE);
          const index = store.index('connectionId');
          const request = index.getAll(IDBKeyRange.only(connectionId), limit);

          request.onsuccess = () => {
              const histories = request.result as TerminalHistory[];
              resolve(histories.sort((a, b) => b.timestamp - a.timestamp));
          };
          request.onerror = () => reject(request.error);
      });
  }

  // 添加历史记录
  async addHistory(history: Omit<TerminalHistory, 'id'>): Promise<number> {
      if (!this.db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([this.HISTORY_STORE], 'readwrite');
          const store = transaction.objectStore(this.HISTORY_STORE);
          const request = store.add(history);

          request.onsuccess = () => resolve(request.result as number);
          request.onerror = () => reject(request.error);
      });
  }

   // 清除历史记录
   async clearHistory(connectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(this.HISTORY_STORE);
        const index = store.index('connectionId');
        const request = index.openKeyCursor(IDBKeyRange.only(connectionId));

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(request.error);
    });
}

    async addConnection(connection: SSHConnection): Promise<number> {
      if (!this.db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.add(connection);

        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    }

    async getAllConnections(): Promise<SSHConnection[]> {
      if (!this.db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async deleteConnection(id: number): Promise<void> {
      if (!this.db) throw new Error('Database not initialized');

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    async updateConnection(connection: SSHConnection): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(connection);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
  }

  export const sshDB = new SSHDatabase();

import { promises as fs } from 'fs';
import path from 'path';
import { rimraf } from 'rimraf';

/**
 * 递归查找并删除所有 node_modules 文件夹
 * @param startPath 开始搜索的路径
 * @returns Promise<string[]> 被删除的 node_modules 路径列表
 */
export async function cleanNodeModules(startPath: string,deleteDirName:string): Promise<string[]> {
    const deletedPaths: string[] = [];

    async function scan(currentPath: string): Promise<void> {
        try {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                if (entry.isDirectory()) {
                    
                    if (entry.name === deleteDirName) {
                        // 找到 node_modules 文件夹，删除它
                        console.log(`正在删除: ${fullPath}`);
                        await rimraf(fullPath);
                        deletedPaths.push(fullPath);
                    } else {
                        // 继续递归搜索其他文件夹
                        await scan(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`扫描路径出错 ${currentPath}:`, error);
        }
    }

    await scan(startPath);
    return deletedPaths;
}

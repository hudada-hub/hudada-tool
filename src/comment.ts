import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * 随机读取 comment 文件夹下的一个 txt 文件内容
 * @returns Promise<string> 文件内容
 */
export async function getRandomComment(options?: { all?: boolean }): Promise<void> {
  try {




    console.log(options);


    // 获取当前文件夹路径
    const notesDir = path.join(__dirname, 'comment');

    // console.log(notesDir);

    // 读取所有文件
    const files = await fs.promises.readdir(notesDir);

    // 过滤出 txt 文件
    const txtFiles = files.filter(file =>
      file.endsWith('.txt') &&
      fs.statSync(path.join(notesDir, file)).isFile()
    );

    if (txtFiles.length === 0) {
      throw new Error('没有找到任何 txt 文件');
    }

    if (options?.all) {
      for (const file of txtFiles) {
        const content = await fs.promises.readFile(
          path.join(notesDir, file),
          'utf-8'
        );
        console.log(content);
      }
      return;
    }



    // 随机选择一个文件
    const randomIndex = Math.floor(Math.random() * txtFiles.length);
    const randomFile = txtFiles[randomIndex];

    // 读取文件内容
    const content = await fs.promises.readFile(
      path.join(notesDir, randomFile),
      'utf-8'
    );

    // console.log(`已随机选择文件: ${randomFile}`);
    console.log(content)

  } catch (error) {
    console.error('读取文件时发生错误:', error);
    throw error;
  }
}


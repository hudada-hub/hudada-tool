// 递归搜索文件夹中的所有文件
import { readFileSync, readdirSync, statSync,existsSync, mkdirSync, appendFileSync } from 'fs';
import path, { dirname, join, extname ,sep,normalize, resolve} from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import chalk from 'chalk';
import { marked } from 'marked';
import open from 'open';
import type { optionsType } from './type';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保配置目录存在
export  const configDir = join(process.env.HOME || process.env.USERPROFILE || '', '.my-cli');
export  const mydirFile = join(configDir, 'mydir.txt');
// 创建配置目录（如果不存在）
if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
}


function highlightKeyword(text: string, keyword: string): string {
    if (!keyword) return text;
    const regex = new RegExp(keyword, 'gi');
    return text.replace(regex, match => chalk.bgYellow.white(match));
}


// 支持的文件类型
export const SUPPORTED_EXTENSIONS = {
    text: ['.md', '.txt','.html','.js','.json','.css','.ts','.tsx','.conf'],
    image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp','.webp']
};


// 获取操作系统对应的打开命令
export  const getOpenCommand = () => {
    switch (os.platform()) {
        case 'darwin': return 'open';      // macOS
        case 'win32': return 'start';      // Windows
        default: return 'xdg-open';        // Linux
    }
};
// 获取 data 目录下所有的 md 文件
export const dataPath = join(__dirname, '../data');



export const availableFiles = readdirSync(dataPath)
    .filter(file => [...SUPPORTED_EXTENSIONS.text, ...SUPPORTED_EXTENSIONS.image].some(ext => file.endsWith(ext)))
    .map(file => file.split('.')[0]);



export function searchInDirectory(dirPath: string, keyword: string): Array<{ file: string; matches: string[] }> {
    const results: Array<{ file: string; matches: string[] }> = [];

    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const isDirectory = statSync(fullPath).isDirectory();

        if (isDirectory) {
          // 递归搜索子目录
          results.push(...searchInDirectory(fullPath, keyword));
        } else {
          // 检查是否是支持的文本文件
          if (SUPPORTED_EXTENSIONS.text.some(ext => item.endsWith(ext))) {
            try {
              const content = readFileSync(fullPath, 'utf-8');
              const lines = content.split('\n');
              const matches = lines.filter(line =>
                line.toLowerCase().includes(keyword.toLowerCase())
              );

              if (matches.length > 0) {
               // 高亮显示匹配的关键字
               const highlightedMatches = matches.map(line =>
                highlightKeyword(line, keyword)
            );
            results.push({
                file: fullPath.replace(dataPath, '').slice(1),
                matches: highlightedMatches
            });
              }
            } catch (error) {
              console.error(chalk.yellow(`警告: 无法读取文件 ${item}`));
            }
          }
        }
      }
    } catch (error) {
      console.error(chalk.yellow(`警告: 无法读取目录 ${dirPath}`));
    }

    return results;
  }


  // 获取目录下的所有文件和文件夹
export const getDirectoryContent = (dirPath: string) => {
    try {
        return readdirSync(dirPath)
            .filter(item => {
                const fullPath = join(dirPath, item);
                const isDirectory = statSync(fullPath).isDirectory();
                const hasValidExtension = [...SUPPORTED_EXTENSIONS.text, ...SUPPORTED_EXTENSIONS.image]
                    .some(ext => item.endsWith(ext));
                return isDirectory || hasValidExtension;
            });
    } catch {
        return [];
    }
};



// 读取已存在的目录路径
export function getExistingPaths(filePath: string): string[] {
    try {
        if (!existsSync(filePath)) {
            return [];
        }
        const content = readFileSync(filePath, 'utf-8');
        return content.split('\n').filter(line => line.trim());
    } catch (error: any) {
        console.error(chalk.red(`读取 mydir.txt 时出错: ${error.message}`));
        return [];
    }
}


// 获取所有搜索路径
export function getAllSearchPaths(): string[] {
    const paths: string[] = [];

    // 1. 添加 data 目录路径
    const dataPath = join(__dirname, '../data');
    if (existsSync(dataPath)) {
        paths.push(dataPath);
    }

    // 2. 读取 mydir.txt 中的路径
    try {
        if (existsSync(mydirFile)) {
            const content = readFileSync(mydirFile, 'utf-8');
            const mydirPaths = content
                .split('\n')
                .filter(line => line.trim())  // 过滤空行
                .filter(path => existsSync(path));  // 过滤不存在的路径
            paths.push(...mydirPaths);
        }
    } catch (error:any) {
        console.error(chalk.yellow(`Warning: Could not read mydir.txt: ${error.message}`));
    }

    return paths;
}

 // 获取所有可用的文件
export function getAllAvailableFiles(): string[] {
    const allFiles = new Set<string>();
    const searchPaths = getAllSearchPaths();

    for (const path of searchPaths) {
        try {
            const files = readdirSync(path)
                .filter(file => SUPPORTED_EXTENSIONS.text.some(ext => file.endsWith(ext)))
                .map(file => file.split('.')[0]);
            files.forEach(file => allFiles.add(file));
        } catch (error:any) {
            console.error(chalk.yellow(`Warning: Could not read directory ${path}: ${error.message}`));
        }
    }

    return Array.from(allFiles);
}

// 在所有路径中搜索文件
export function findFileInPaths(fileName: string): string | null {
    const searchPaths = getAllSearchPaths();

    const allExtensions = [...SUPPORTED_EXTENSIONS.text, ...SUPPORTED_EXTENSIONS.image];
// 将文件名转换为小写进行比较
const lowerFileName = fileName.toLowerCase();

    for (const path of searchPaths) {
        // 如果文件名已经包含扩展名
        if (allExtensions.some(ext => lowerFileName.endsWith(ext))) {
            const filePath = join(path, fileName);
            if (existsSync(filePath)) {
                return filePath;
            }
        } else {
            // 尝试所有支持的扩展名
            for (const ext of allExtensions) {
                const filePath = join(path, fileName + ext);
                if (existsSync(filePath)) {
                    return filePath;
                }
            }
        }
    }
    return null;
}



// 修改现有的 getFileContent 函数
export function getFileContent(options: optionsType, commandObj: any, isSub: boolean,args:string[]) {
    const { mainCommand, subCommand } = commandObj;

    let fileName = '';
    if (options.append) {
        try {
            const paths = getAllSearchPaths();

           
            let arg = process.argv.slice(2);
            const appendIndex = arg.findIndex(arg => arg === '-a' || arg === '--append');
            if (appendIndex === -1) return;
            const pathArgs = arg.slice(0, appendIndex);
            const [mainCommand, subCommand] = pathArgs;


            // 获取完整的追加文本，包括所有参数
            const appendText = arg.slice(appendIndex+1).join(' ');  // 从第三个参数开始拼接



            if (!appendText) {
                console.error(chalk.yellow('请提供要追加的文本'));
                return;
            }
            // let filePath :string | null = join(dataPath, mainCommand);


            let fileName = subCommand
            ? `/${subCommand}${subCommand.endsWith('.md') ? '' : '.md'}`
            : '';

     
        let filePath='';
        for (let i=paths.length-1; i>-1; i--) {
         
          
       
            let subCommand = commandObj.subCommand??"";
            if (subCommand) {
                subCommand=path.extname(subCommand)?subCommand:subCommand+".md";
               
            }else{
                commandObj.mainCommand=path.extname(commandObj.mainCommand)?commandObj.mainCommand:commandObj.mainCommand+".md";
            }
            
             let tempFilePath = resolve(paths[i],commandObj.mainCommand,subCommand);
       
            const exists = existsSync(tempFilePath)
            // console.log(tempFilePath,commandObj);
            
            if(exists){
                filePath=tempFilePath;
             
                
                break;
            }

      
            
         
        }
     
        




            if(!filePath) return;

            appendFileSync(filePath, `\n${appendText}\n`);
            console.log(chalk.green(`文本已追加到文件`));
            return;
        } catch (error: any) {
            console.error(chalk.red(`追加文本失败: ${error.message}`));
            return;
        }
    }else{
         fileName = `${mainCommand}${subCommand ? `/${subCommand}` : ''}`;
    }



    
    
    
   // 尝试在所有路径中找到文件
   const filePath = findFileInPaths(fileName);

   if (!filePath) {
    const allExts = [...SUPPORTED_EXTENSIONS.text, ...SUPPORTED_EXTENSIONS.image];
    console.error(chalk.red(`未找到文件: ${fileName} (支持的文件类型: ${allExts.join(', ')})`));
    return;
}

    //如果subCommand里有后缀名,则直接使用,如果没有,则默认.md后缀名
    const ext = extname(filePath).toLowerCase();


    try {

         // 处理图片文件
         if (SUPPORTED_EXTENSIONS.image.includes(ext)) {
            console.log(chalk.green(`正在打开图片文件:  ${filePath}`));
            open(filePath);
            return;
        }
        const content = readFileSync(filePath, 'utf-8');

        if (options.search) {
            const lines = content.split('\n');
            const matches = lines.filter(line =>
                line.toLowerCase().includes(options.search!.toLowerCase())
            );

            if (matches.length > 0) {
                console.log(chalk.green(`找到  ${matches.length} 处匹配:`));
                  // 高亮显示匹配的关键字
                  const highlightedMatches = matches.map(line =>
                    highlightKeyword(line, options.search!)
                );
                console.log(marked(highlightedMatches.join('\n')));
            } else {
                console.log(chalk.yellow('未找到匹配内容'));
            }
        } else {
            console.log(marked(content));
        }
    } catch (error:any) {
        console.error(chalk.red(`处理文件时出错: ${error.message}`));
    }
}
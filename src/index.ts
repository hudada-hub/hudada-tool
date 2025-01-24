import { Argument, Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, readdirSync, existsSync, statSync, appendFileSync, mkdirSync, writeFileSync } from 'fs';

import path, { dirname, join, extname, sep } from 'path';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { getDirectoryContent, dataPath, availableFiles, getFileContent, searchInDirectory, getAllSearchPaths, getExistingPaths, configDir, mydirFile } from './file';

import type { optionsType } from './type';
import { removeFileOrDirectory } from './rm';
import { handleBaiduSearch, handleBilibiliSearch, handleBingSearch, handleCSDNSearch, handleGithubSearch, handleGoogleSearch, handleHttpUrl, handleHttpUrlPrivate, handleJuejinSearch, handleMDN, handleNpmSearch, handleStackOverflowSearch, handleZhihuSearch } from './websearch/web';
import { handleDNSLookup } from './websearch/dns';
import { handlePngUrls } from './websearch/images';
import { handleMusicUrls } from './websearch/music';

import { handleSetTranslateKey, handleTranslateSet, translate } from './websearch/translate';
import { handleAi } from './ai';
import { startPreview } from './preview';
import { handleDate } from './date';
import { handleColor } from './color';
import { handleVim } from './vim';
import { handleVSCode } from './vs';
import { startLocalServer } from './local';
import { startSSHServer } from './ssh';
import { compressImages } from './image/compress';
import { processImages } from './image/remove-bg';
import { listFiles } from './file/list';
import { killPort } from './process/kill';
import { touchFile } from './file/touch';
import { makeDirectory } from './file/mkdir';
import { moveFileOrDirectory } from './file/move';
import { copyFileOrDirectory } from './file/copy';
import { zipFileOrDirectory } from './file/zip';
import { unzipFile } from './file/unzip';
import { findItems } from './file/find';
import { getSystemInfo } from './system/os';
import { managePath } from './system/path';
import { manageHosts } from './system/host';
import { fileURLToPath } from 'url';
import { md5String } from './md5';
import { base64String } from './base64';
import { getRandomComment } from './comment';
import { cleanNodeModules } from './cleanModules';
import { installDependencies } from './npmInstall';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// @ts-ignore
marked.use(markedTerminal({}));

//
//                            _ooOoo_
//                           o8888888o
//                           88" . "88
//                           (| -_- |)
//                           O\  =  /O
//                        ____/`---'\____
//                      .'  \\|     |//  `.
//                     /  \\|||  :  |||//  \
//                    /  _||||| -:- |||||-  \
//                    |   | \\\  -  /// |   |
//                    | \_|  ''\---/''  |   |
//                    \  .-\__  `-`  ___/-. /
//                  ___`. .'  /--.--\  `. . __
//               ."" '<  `.___\_<|>_/___.'  >'"".
//              | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//              \  \ `-.   \_ __\ /__ _/   .-` /  /
//         ======`-.____`-.___\_____/___.-`____.-'======
//                            `=---='
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                      佛祖保佑       永无BUG
const program = new Command();

let isAllSearch = false;
function getPackageVersion(): string {
    try {
        // 尝试读取项目根目录的 package.json
        const packagePath = path.resolve(__dirname, '..', 'package.json');

        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        return packageJson.version || '0.0.0';
    } catch (error) {
        console.error(chalk.yellow('无法读取 package.json 版本号'), error);
        return '0.0.0';
    }
}


program
    .name('my')
    .description('一个基于nodejs的命令行工具,可以干很多活')
    .version(getPackageVersion())
    .arguments('[command...]')  // 使用可变参数

    .option('-s, --search <keyword>', '搜索指定内容（仅限文本文件）')
    .option('-d, --dir <path>', '添加目录路径到 mydir.txt')
    .option('-l, --list', '列出所有可用的搜索路径')
    .option('-r, --remove-dir <path>', '从 mydir.txt 中删除指定的目录路径')
    .option('-a, --append <text>', '追加文本到文档中')

    .action(async (args: string[], options: optionsType) => {
        try {


            if (process.argv.length <= 2) {
                program.help();
            }




            if (options.list) {
                const paths = getAllSearchPaths();
                console.log(chalk.green('可用的搜索路径:'));
                paths.forEach(path => {
                    console.log(chalk.blue(`- ${path}`));
                });
                return;
            }
            // 处理 -d 参数
            if (options.dir) {
                try {
                    const dirPath = options.dir;
                    // 检查目录是否存在
                    if (!existsSync(dirPath)) {
                        console.error(chalk.red(`Directory not found: ${dirPath}`));
                        process.exit(1);
                    }
                    // 检查是否是目录
                    if (!statSync(dirPath).isDirectory()) {
                        console.error(chalk.red(`Not a directory: ${dirPath}`));
                        process.exit(1);
                    }
                    // 获取现有路径并检查是否已存在
                    const existingPaths = getExistingPaths(mydirFile);
                    const normalizedPath = dirPath.replace(/\\/g, '/').replace(/\/+$/, '');
                    if (existingPaths.some(path =>
                        path.replace(/\\/g, '/').replace(/\/+$/, '') === normalizedPath
                    )) {
                        console.log(chalk.yellow(`目录已经存在 ${configDir}${sep}mydir.txt: ${dirPath}`));
                        return;
                    }

                    // 将路径追加到文件
                    appendFileSync(mydirFile, dirPath + '\n');
                    console.log(chalk.green(`本地文档路径已添加: ${dirPath}`));
                    return;
                } catch (error: any) {
                    console.error(chalk.red(`Error adding directory: ${error.message}`));
                    process.exit(1);
                }
            }

            // 处理删除目录的参数 (改用 removeDir)
            if (options.removeDir) {
                try {
                    const dirPath = options.removeDir;
                    const existingPaths = getExistingPaths(mydirFile);
                    const normalizedPathToDelete = dirPath.replace(/\\/g, '/').replace(/\/+$/, '');

                    const filteredPaths = existingPaths.filter(path =>
                        path.replace(/\\/g, '/').replace(/\/+$/, '') !== normalizedPathToDelete
                    );

                    if (filteredPaths.length === existingPaths.length) {
                        console.log(chalk.yellow(`目录在 ${configDir}${sep}mydir.txt: ${dirPath}
                             不存在`));
                        return;
                    }

                    // 重写文件，保存剩余的路径
                    writeFileSync(mydirFile, filteredPaths.join('\n') + (filteredPaths.length > 0 ? '\n' : ''));
                    console.log(chalk.green(`本地文档路径已移除: ${dirPath}`));
                    return;
                } catch (error: any) {
                    console.error(chalk.red(`移除文档路径错误: ${error.message}`));
                    process.exit(1);
                }
            }
            let argv = process.argv.slice(2);
            let arglist = [
                '-a',
                '--append',
                '-r',
                '--remove-dir',
                '-d',
                '--dir',
                '-l',
                '--list'
            ]
            let lastIndex = argv.findIndex(arg => {
                if (arglist.includes(arg)) {
                    return true;
                }
                return false;
            });
            let mainCommand = '';
            let subCommand = '';

            if (lastIndex === -1) {
                [mainCommand, subCommand] = argv
            } else {
                [mainCommand, subCommand] = argv.slice(0, lastIndex);
            }





            const commandPath = join(dataPath, mainCommand);
            const commandObj = {
                mainCommand,
                subCommand,
                commandPath,
            }

            let isDirectory = false;
            try {
                isDirectory = statSync(commandPath).isDirectory();
            } catch {
                // 如果 statSync 失败，说明可能是文件
                isDirectory = false;
            }

            // 检查是否是目录
            if (isDirectory) {

                if (subCommand) {
                    getFileContent(options, commandObj, true, args);
                } else {

                    // 如果有全局搜索参数和搜索关键词
                    if (options.search) {
                        const results = searchInDirectory(commandPath, options.search);

                        if (results.length > 0) {
                            console.log(chalk.green(`Found matches in ${results.length} files:`));
                            results.forEach(({ file, matches }) => {
                                console.log(chalk.blue(`\nFile: ${file}`));
                                console.log(chalk.yellow(`${matches.length} matches found:`));
                                console.log(marked(matches.join('\n')));
                            });
                        } else {
                            console.log(chalk.yellow('No matches found.'));
                        }
                        return;
                    }
                    // 显示目录内容
                    const contents = getDirectoryContent(commandPath);
                    console.log(chalk.green(`Contents of ${mainCommand} directory:`));
                    contents.forEach(item => {
                        const isDir = statSync(join(commandPath, item)).isDirectory();
                        console.log(chalk.blue(`${isDir ? '📁' : '📄'} ${item}`));
                    });
                    return;
                }
            } else {
                getFileContent(options, commandObj, false, args);
            }



        } catch (error) {
            console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            console.log(chalk.yellow(`Available commands: ${availableFiles.join(', ')}`));
            process.exit(1);

        }finally {
            process.exit(0);
        }
    });



program
    .command('local [port]')
    .description(`启动本地文件传输服务,适合大部分公司内部局域网传输;\n 将在本地命令行所在的文件夹创建一个${chalk.green('uploads')}文件夹,上传的文件都保存到该文件夹下`)

    .option('-p, --port <number>', '指定端口号（默认: 667）')
    .action((cmdPort, options) => {
        console.log(cmdPort, 'cmdPort', options);

        // 优先使用命令行参数的端口号，其次使用选项的端口号，最后使用默认值
        const port = cmdPort || options.port || 667;

        // 确保端口号是数字
        const portNumber = parseInt(port as string, 10);

        if (isNaN(portNumber) || portNumber < 0 || portNumber > 65535) {
            console.error(chalk.red('无效的端口号，端口号必须在 0-65535 之间'));
            return;
        }
        startLocalServer(port)
    });


program.command('ls')
    .description('格式化列出当前目录内容')
    .action(async () => {
        await listFiles();
        process.exit(0);
    });

// 端口管理命令
program
    .command('kill <port>')
    .description('结束指定端口的进程')
    .action(async (port) => {
        await killPort(port);
        process.exit(0);
    });

// 图片处理命令组
program
    .command('koutu')
    .description('批量处理图片抠图，将当前目录下的所有图片进行智能抠图处理')
    .action(async () => {
        await processImages();
        process.exit(0);
    });

program
    .command('imgp')
    .description('压缩当前目录下的所有图片，支持 jpg、png、gif 等格式\n  压缩后的图片将保存在 compressed 文件夹中')
    .action(async () => {
        await compressImages();
        process.exit(0);
    });

// SSH 服务器命令
program
    .command('ssh')
    .description('启动 SSH 服务器，用于远程连接和文件传输\n  默认端口为 22，可通过 --port 选项指定其他端口')
    .option('-p, --port <number>', '指定 SSH 服务器端口号')
    .action(async (options) => {
        await startSSHServer(options.port);
        process.exit(0);
    });

// VS Code 相关命令
program
    .command('vs [paths...]')
    .description('使用 VS Code 打开指定的文件或目录\n  如果不指定路径，则打开当前目录')
    .option('-n, --new', '在新窗口中打开')
    .option('-r, --reuse', '复用已有窗口')
    .action((paths,) => {
        handleVSCode(paths);
        process.exit(0);
    });

// 颜色处理命令
program
    .command('color <value>')
    .description('颜色值转换工具，支持多种颜色格式互转：\n' +
        '  - HEX 转 RGB/RGBA\n' +
        '  - RGB/RGBA 转 HEX\n' +
        '  - 颜色名称转 HEX/RGB\n' +
        '示例：\n' +
        '  color #ff0000\n' +
        '  color rgb(255,0,0)\n' +
        '  color red')
    .action((value) => {
        handleColor([value]);
        process.exit(0);
    });

// 日期时间命令
program
    .command('date')
    .description('显示当前日期时间信息：\n' +
        '  - 当前时间戳\n' +
        '  - 格式化日期时间\n' +
        '  - UTC 时间\n' +
        '  - 本地时区信息')
    .action(() => {
        handleDate();
        process.exit(0);
    });

// 预览命令
program
    .command('preview')
    .description('启动本地预览服务器\n' +
        '  - 支持热更新\n' +
        '  - 自动打开浏览器\n' +
        '  - 支持静态文件服务')
    .option('-p, --port <number>', '指定预览服务器端口号', '3000')
    .action(async (options) => {
        await startPreview(options.port);
        process.exit(0);
    });

// 翻译相关命令
program
    .command('translate')
    .alias('t')
    .description('文本翻译工具')
    .arguments('<text...>')
    .option('--to <lang>', '翻译目标语言')
    .action(async (text, options) => {


        await handleSetTranslateKey();
        process.exit(0);
    });


// AI 助手命令
program
    .command('ai [prompt...]')
    .description('AI 助手工具'+`
        my ai list: 列出所有 AI 对话模板
        my ai add: 添加新的 AI 对话模板
        my ai key :添加deepseek api key
        my ai clear:清除聊天历史记录
        
        
        `)
    .action(async (prompt, arg) => {
      

        if (!prompt || prompt.length === 0) {
            console.log(chalk.yellow('请输入要询问的内容'));

            process.exit(0);
            return;
        }
        await handleAi(prompt);
    });

// HTTP 请求命令组
program
    .command('http <url>')
    .description('在默认浏览器中打开网页\n' +
        '  - 支持自动补全 http:// 前缀\n' +
        '  - 支持本地和远程 URL\n' +
        '  - 支持多种协议 (http, https)\n' +
        '示例：\n' +
        '  http google.com\n' +
        '  http https://github.com\n' +
        '  http localhost:3000')
    .action(async (url) => {
        await handleHttpUrl(url);
    });

program
    .command('httpp <url>')
    .description('在浏览器隐私模式下打开网页\n' +
        '  - 自动使用隐私模式\n' +
        '  - 支持多种浏览器\n' +
        '  - 不保留浏览记录\n' +
        '示例：\n' +
        '  httpp google.com\n' +
        '  httpp https://github.com\n' +
        '  httpp localhost:3000')
    .action(async (url) => {
        await handleHttpUrlPrivate(url);
    });

// 媒体处理命令组
program
    .command('mp3')
    .description('给出10个mp3 文件链接')
    .action(() => {
        handleMusicUrls();
        process.exit(0);
    });

program
    .command('png')
    .description('给出10个png 图片链接')
    .action(() => {
        handlePngUrls();
        process.exit(0);
    });

// DNS 查询命令
program
    .command('dns <domain>')
    .description('DNS 查询工具\n' +
        '  - 支持 A 记录查询\n' +
        '  - 支持 CNAME 查询\n' +
        '  - 支持 MX 记录查询\n' +
        '示例：dns example.com')
    .action(async (domain) => {
        await handleDNSLookup(domain);
        process.exit(0);
    });

// 文件系统命令组
program
    .command('rm <path>')
    .description('删除文件或目录\n' +
        '  - 支持递归删除\n' +
        '  - 支持强制删除\n' +
        '  - 支持通配符')
    .option('-f, --force', '强制删除，不提示')
    .option('-r, --recursive', '递归删除目录')
    .action(async (path, options) => {
        await removeFileOrDirectory(path);
        process.exit(0);
    });

program
    .command('touch <path>')
    .description('创建新文件或更新时间戳\n' +
        '  - 如果文件不存在则创建\n' +
        '  - 如果文件存在则更新时间戳')
    .action(async (path) => {
        await touchFile(path);
        process.exit(0);
    });

program
    .command('mkdir <path>')
    .description('创建目录\n' +
        '  - 支持递归创建\n' +
        '  - 支持权限设置')
    .option('-p, --parents', '递归创建父目录')
    .option('-m, --mode <mode>', '设置目录权限')
    .action(async (path, options) => {
        await makeDirectory(path);
        process.exit(0);
    });

program
    .command('mv <source> <destination>')
    .description('移动文件或目录\n' +
        '  - 支持重命名\n' +
        '  - 支持跨目录移动\n' +
        '  - 支持批量移动')
    .action(async (source, destination) => {
        await moveFileOrDirectory(source, destination);
        process.exit(0);
    });

program
    .command('cp <source> <destination>')
    .description('复制文件或目录\n' +
        '  - 支持递归复制\n' +
        '  - 支持保留属性\n' +
        '  - 支持批量复制')
    .option('-r, --recursive', '递归复制目录')
    .option('-p, --preserve', '保留文件属性')
    .action(async (source, destination, options) => {
        await copyFileOrDirectory(source, destination,);
        process.exit(0);
    });

program
    .command('zip <source> <destination>')
    .description('压缩文件或目录\n' +
        '  - 支持多种压缩格式\n' +
        '  - 支持密码保护\n' +
        '  - 支持压缩等级设置')
    .option('-p, --password <password>', '设置压缩包密码')
    .option('-l, --level <level>', '设置压缩等级 (1-9)', '6')
    .action(async (source, destination, options) => {
        await zipFileOrDirectory(source, destination);
        process.exit(0);
    });

program
    .command('unzip <source> [destination]')
    .description('解压缩文件\n' +
        '  - 支持多种压缩格式\n' +
        '  - 支持密码保护\n' +
        '  - 自动检测编码')
    .option('-p, --password <password>', '设置解压密码')
    .action(async (source, destination, options) => {
        await unzipFile(source, destination);
        process.exit(0);
    });

program
    .command('find [path] [pattern]')
    .description('查找文件和目录\n' +
        '  - 支持正则表达式\n' +
        '  - 支持文件类型过滤\n' +
        '  - 支持大小和时间过滤')
    .action(async () => {
       
        await findItems();
        process.exit(0);
    });

// 系统命令组
program
    .command('os')
    .description('显示系统信息\n' +
        '  - CPU 信息\n' +
        '  - 内存使用情况\n' +
        '  - 磁盘使用情况\n' +
        '  - 网络接口信息')
    .action(async () => {
        await getSystemInfo();
        process.exit(0);
    });

program
    .command('host <action> [hostname] [ip]')
    .description('hosts 文件管理工具\n' +
        '命令：\n' +
        '  - add: 添加 hosts 记录\n' +
        '  - remove: 删除 hosts 记录\n' +
        '  - list: 列出所有记录\n' +
        '示例：\n' +
        '  host add example.com 127.0.0.1\n' +
        '  host remove example.com\n' +
        '  host list')
    .action(async (action, hostname, ip) => {
        await manageHosts(action, hostname, ip);
        process.exit(0);
    });

// 全局搜索命令
program
    .command('s <keyword>')
    .description('在所有支持的平台上搜索内容\n' +
        '  - 同时搜索多个平台\n' +
        '  - 自动打开浏览器标签页\n' +
        '  - 支持的平台包括：\n' +
        '    · GitHub, NPM\n' +
        '    · Google, Bing, Baidu\n' +
        '    · StackOverflow, MDN\n' +
        '    · 掘金, 知乎, CSDN, 哔哩哔哩')
    .action(async (keyword) => {
        const searchFunctions = [
            { fn: handleGithubSearch, name: 'GitHub' },
            { fn: handleBaiduSearch, name: '百度' },
            { fn: handleStackOverflowSearch, name: 'StackOverflow' },
            { fn: handleBilibiliSearch, name: '哔哩哔哩' },
            { fn: handleJuejinSearch, name: '掘金' },
            { fn: handleZhihuSearch, name: '知乎' },
            { fn: handleMDN, name: 'MDN' },
            { fn: handleCSDNSearch, name: 'CSDN' },
            { fn: handleNpmSearch, name: 'NPM' },
            { fn: handleGoogleSearch, name: 'Google' },
            { fn: handleBingSearch, name: 'Bing' }
        ];

        console.log(chalk.blue(`正在所有平台搜索: ${keyword}`));

        for (const { fn, name } of searchFunctions) {
            try {
                console.log(chalk.green(`正在 ${name} 上搜索...`));
                await fn(keyword);
            } catch (error: any) {
                console.error(chalk.red(`${name} 搜索失败:`, error.message));
            }
        }
    });

// 单平台搜索命令组
program
    .command('github <keyword>')
    .description('在 GitHub 上搜索代码和项目\n' +
        '  - 搜索仓库\n' +
        '  - 搜索代码\n' +
        '  - 搜索问题')
    .action(async (keyword) => {
        await handleGithubSearch(keyword);
        process.exit(0);
    });

program
    .command('baidu <keyword>')
    .description('使用百度搜索\n' +
        '  - 支持中文搜索\n' +
        '  - 支持智能推荐')
    .action(async (keyword) => {
        await handleBaiduSearch(keyword);
        process.exit(0);
    });

program
    .command('bug <keyword>')
    .alias('stackoverflow')
    .description('在 StackOverflow 上搜索问题和解答\n' +
        '  - 搜索编程问题\n' +
        '  - 查看解决方案')
    .action(async (keyword) => {
        await handleStackOverflowSearch(keyword);
        process.exit(0);
    });

program
    .command('bili <keyword>')
    .alias('bilibili')
    .description('在哔哩哔哩搜索视频\n' +
        '  - 搜索视频\n' +
        '  - 搜索UP主\n' +
        '  - 搜索专栏')
    .action(async (keyword) => {
        await handleBilibiliSearch(keyword);
        process.exit(0);
    });

program
    .command('juejin <keyword>')
    .description('在掘金搜索技术文章\n' +
        '  - 搜索文章\n' +
        '  - 搜索作者\n' +
        '  - 搜索专栏')
    .action(async (keyword) => {
        await handleJuejinSearch(keyword);
        process.exit(0);
    });

program
    .command('zhihu <keyword>')
    .description('在知乎搜索问答\n' +
        '  - 搜索问题\n' +
        '  - 搜索回答\n' +
        '  - 搜索专栏')
    .action(async (keyword) => {
        await handleZhihuSearch(keyword);
        process.exit(0);
    });

program
    .command('mdn <keyword>')
    .description('在 MDN 搜索 Web 开发文档\n' +
        '  - HTML/CSS/JavaScript 文档\n' +
        '  - Web API 文档\n' +
        '  - 开发指南')
    .action(async (keyword) => {
        await handleMDN([keyword]);
        process.exit(0);
    });

program
    .command('csdn <keyword>')
    .description('在 CSDN 搜索技术文章\n' +
        '  - 搜索博客\n' +
        '  - 搜索问答\n' +
        '  - 搜索资源')
    .action(async (keyword) => {
        await handleCSDNSearch(keyword);
        process.exit(0);
    });

program
    .command('npm <keyword>')
    .description('在 NPM 搜索包\n' +
        '  - 搜索包名\n' +
        '  - 查看包信息\n' +
        '  - 查看包文档')
    .action(async (keyword) => {
        await handleNpmSearch(keyword);
        process.exit(0);
    });

program
    .command('google <keyword>')
    .description('使用 Google 搜索\n' +
        '  - 全球搜索\n' +
        '  - 支持高级搜索语法')
    .action(async (keyword) => {
        await handleGoogleSearch(keyword);
        process.exit(0);
    });

program
    .command('bing <keyword>')
    .description('使用 Bing 搜索\n' +
        '  - 全球搜索\n' +
        '  - AI 驱动的搜索结果')
    .action(async (keyword) => {
        await handleBingSearch(keyword);
        process.exit(0);
    });

// MD5 加密命令
program
    .command('md5 <text>')
    .description('对字符串进行 MD5 加密')
    .action(async (text) => {
        if (!text || text.length === 0) {
            console.log(chalk.yellow('请输入要加密的字符串'));
            return;
        }
        md5String(text);
        process.exit(0);
    });

program
    .command('base64 <text>')
    .description('Base64 转换功能')
    .action(async (text) => {
        if (!text || text.length === 0) {
            console.log(chalk.yellow('请输入文件路径'));
            return;
        }
        base64String(text);
        process.exit(0);
    });



// PATH 环境变量管理命令
program
    .command('path')
    .description('管理系统环境变量 PATH')
    .argument('[action]', '操作类型：add/remove/list')
    .argument('[targetPath]', '目标路径')
    .action(async (action, targetPath) => {
        await managePath(action, targetPath);
    });


program.command('comment')
.option('-g, --all', '获取所有的注释')
.description("获取意思的注释")
.action(async (options) => {

    await getRandomComment(options);
    process.exit(0);

});

program.command('cleannode')
.description("默认递归清除node_modules,使用my cleannode [dir] 递归清除指定目录")
.addArgument(new Argument('[dir]'))
.action(async (arg,options) => {

   
    
    const targetPath =  process.cwd();
    let deleteDirName=  'node_modules';
    if(arg){
        deleteDirName = arg;
    }
    console.log(`开始清理 ${deleteDirName}，起始路径: ${targetPath}`);

    try {
        const deletedPaths = await cleanNodeModules(targetPath,deleteDirName);
        console.log('\n清理完成！');
        console.log(`共删除了 ${deletedPaths.length} 个 ${deleteDirName} 文件夹：`);
        deletedPaths.forEach(path => console.log(`- ${path}`));
    } catch (error) {
        console.error('清理过程中发生错误:', error);
        process.exit(1);
    }

});

program
    .command('install [path]')
    .description('递归安装所有 package.json 的依赖\n' +
        '  - 自动检测子目录中的 package.json\n' +
        '  - 使用 pnpm 进行安装\n' +
        '  - 跳过 node_modules 目录')
    .action(async (path) => {
        await installDependencies(path || '.');
        process.exit(0);
    });
program.parse();



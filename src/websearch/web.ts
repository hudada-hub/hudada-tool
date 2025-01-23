// 添加到文件顶部的导入部分
import chalk from 'chalk';
import open, { apps } from 'open';

// 添加这个新函数
export async function handleGithubSearch(keyword: string) {
    try {
        const searchUrl = `https://github.com/search?q=${encodeURIComponent(keyword)}&type=repositories`;
        console.log(chalk.green(`正在打开 GitHub 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 GitHub 搜索失败: ${error.message}`));
    }
}


export async function handleBaiduSearch(keyword: string) {
    try {
        const searchUrl = `https://kaifa.baidu.com/searchPage?wd=${encodeURIComponent(keyword +' -李彦宏')}`;
        console.log(chalk.green(`正在打开百度开发者搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开百度搜索失败: ${error.message}`));
    }
}


export async function handleStackOverflowSearch(keyword: string) {
    try {
        const searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开 Stack Overflow 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 Stack Overflow 搜索失败: ${error.message}`));
    }
}


export async function handleBilibiliSearch(keyword: string) {
    try {
        const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开 B站 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 B站 搜索失败: ${error.message}`));
    }
}


export async function handleJuejinSearch(keyword: string) {
    try {
        const searchUrl = `https://juejin.cn/search?query=${encodeURIComponent(keyword)}&fromSeo=0&fromHistory=0&fromSuggest=0`;
        console.log(chalk.green(`正在打开掘金搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开掘金搜索失败: ${error.message}`));
    }
}

export async function handleZhihuSearch(keyword: string) {
    try {
        const searchUrl = `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开知乎搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开知乎搜索失败: ${error.message}`));
    }
}

export async function handleCSDNSearch(keyword: string) {
    try {
        const searchUrl = `https://so.csdn.net/so/search?q=${encodeURIComponent(keyword)}&t=&u=`;
        console.log(chalk.green(`正在打开 CSDN 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 CSDN 搜索失败: ${error.message}`));
    }
}

export async function handleBingSearch(keyword: string) {
    try {
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开 Bing 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 Bing 搜索失败: ${error.message}`));
    }
}

export async function handleGoogleSearch(keyword: string) {
    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开 Google 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 Google 搜索失败: ${error.message}`));
    }
}

export async function handleHttpUrl(url: string) {
    try {
        // 确保 URL 包含协议
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }

        console.log(chalk.green(`正在打开网页: ${url}`));
        await open(url);
    } catch (error: any) {
        console.error(chalk.red(`打开网页失败: ${error.message}`));
    }
}

export async function handleHttpUrlPrivate(url: string) {
    try {
        // 确保 URL 包含协议
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }

        console.log(chalk.green(`正在打开网页: ${url}`));
        await open(url,{app: {name: apps.browserPrivate}});
    } catch (error: any) {
        console.error(chalk.red(`打开网页失败: ${error.message}`));
    }
}

export async function handleNpmSearch(keyword: string) {
    try {
        const searchUrl = `https://www.npmjs.com/search?q=${encodeURIComponent(keyword)}`;
        console.log(chalk.green(`正在打开 npm 搜索: ${keyword}`));
        await open(searchUrl);
    } catch (error: any) {
        console.error(chalk.red(`打开 npm 搜索失败: ${error.message}`));
    }
}

export async function handleMDN(args: string[]) {
    try {
        if (args.length === 0) {
            console.log(chalk.yellow('请提供搜索关键词，例如：'));
            console.log(chalk.blue('my mdn array'));
            console.log(chalk.blue('my mdn "promise all"'));
            return;
        }

        // 合并所有参数作为搜索词
        const searchTerm = args.join(' ');

        // 构建 MDN 搜索 URL
        const searchUrl = `https://developer.mozilla.org/zh-CN/search?q=${encodeURIComponent(searchTerm)}`;

        // 打开浏览器
        await open(searchUrl);
        console.log(chalk.green(`正在浏览器中打开 MDN 搜索：${searchTerm}`));

    } catch (error) {
        console.error(chalk.red('打开浏览器失败：'), error instanceof Error ? error.message : '未知错误');
    }
}
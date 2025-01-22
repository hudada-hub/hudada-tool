import { createHash } from 'crypto';
import { request } from 'http';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { log } from 'console';

function md5(text: string): string {
    return createHash('md5').update(text).digest('hex');
}

interface TranslateConfig {
    BAIDU_APP_ID: string;
    BAIDU_SECRET: string;
}

interface TranslateResponse {
    from: string;
    to: string;
    trans_result: Array<{
        src: string;
        dst: string;
    }>;
}

function isChineseOrEnglish(str: string): 'chinese' | 'english' | 'mixed' {
    const chineseRegex = /[\u4e00-\u9fa5]/;  // 匹配中文字符
    const englishRegex = /[a-zA-Z]/;         // 匹配英文字符

    const hasChinese = chineseRegex.test(str);
    const hasEnglish = englishRegex.test(str);

    if (hasChinese && !hasEnglish) return 'chinese';
    if (!hasChinese && hasEnglish) return 'english';
    return 'mixed';
}

export async function handleSetTranslateKey() {
    const configPath = path.join(process.cwd(), 'translate.txt');
    
    let text ='';
    if(process.argv.indexOf('--to')!==-1&&process.argv.indexOf('--to')>3){
        text=process.argv.slice(3,process.argv.indexOf('--to')).join(' ');
      
    }else{
        text=process.argv.slice(3).join(' ');
    }
    
  




    // 检查配置是否存在
    const config = await getConfig(configPath);
    if (!config) {
        console.log(chalk.yellow('翻译功能未配置'));
        handleTranslateSet();
        return;
    }

    // 继续执行翻译逻辑
    if (!text) {
        console.log(chalk.red('请输入要翻译的文本'));
        return;
    }
   
    

    // 调用翻译API
    await translate(text, config);
}

export async function handleTranslateSet() {
    const configPath = path.join(process.cwd(), 'translate.txt');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(query, (answer) => {
                resolve(answer);
            });
        });
    };

    try {
        console.log(chalk.cyan('请配置百度翻译 API 参数：'));

        let appId = '';
        let secret = '';

        while (!appId) {
            appId = (await question('请输入 APP ID: ')).trim();
            if (!appId) {
                console.log(chalk.red('APP ID 不能为空！'));
            }
        }

        while (!secret) {
            secret = (await question('请输入密钥: ')).trim();
            if (!secret) {
                console.log(chalk.red('密钥不能为空！'));
            }
        }

        const config = {
            BAIDU_APP_ID: appId,
            BAIDU_SECRET: secret
        };

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green('配置保存成功！'));

    } catch (error) {
        console.error(chalk.red('配置保存失败:', error));
    } finally {
        rl.close();
    }
}

async function getConfig(configPath: string): Promise<TranslateConfig | null> {
    try {
        const content = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

export async function translate(text: string, config: TranslateConfig) {
    // console.log(config,'config');
    
    const { BAIDU_APP_ID, BAIDU_SECRET } = config;
    try {
        const type = isChineseOrEnglish(text);
        let to = '';
        // console.log(process.argv,'process.argv');
        
       // 查找 -to 选项
       const toIndex = process.argv.indexOf('--to');
       if (toIndex !== -1 && toIndex + 1 < process.argv.length) {
           to = process.argv[toIndex + 1];
           if (!to) {
               console.log(chalk.red('请提供要翻译的语言'));
               return;
           }
       } else {
           // 自动检测语言
           if (type === 'chinese') {
               to = 'en';
           } else if (type === 'english') {
               to = 'zh';
           }
       }
        

      
    
        const salt = Date.now();
        const str = BAIDU_APP_ID + text + salt + BAIDU_SECRET;
        const sign = md5(str);



        // 构建查询参数
        const params = new URLSearchParams({
            q: text,
            from: 'auto',
            to,
            appid: BAIDU_APP_ID,
            salt: salt.toString(),
            sign
        });

        // 构建完整URL
        const url = `http://fanyi-api.baidu.com/api/trans/vip/translate?${params.toString()}`;

        // 返回Promise包装的HTTP请求
        const response = await new Promise<TranslateResponse>((resolve, reject) => {
            request(url, (res) => {
                let data = '';

                res.on('data', chunk => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.error_code) {
                            reject(new Error(`翻译错误: ${result.error_msg}`));
                        } else {
                            resolve(result);
                        }
                    } catch (err) {
                        reject(new Error('解析响应失败'));
                    }
                });

                res.on('error', err => {
                    reject(err);
                });
            })
            .on('error', err => {
                reject(err);
            })
            .end();
        });

        const result = response.trans_result[0];
        console.log(chalk.green(`原文: ${result.src}`));
        console.log(chalk.blue(`译文: ${result.dst}`));

    } catch (error: any) {
        console.error(chalk.red(`翻译失败: ${error.message}`));
    }
}
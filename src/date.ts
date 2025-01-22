import chalk from 'chalk';

export function handleDate() {
    const now = new Date();

    // 获取时间戳
    const timestamp = now.getTime();
    const unixTimestamp = Math.floor(timestamp / 1000);

    // 格式化当前时间
    const formattedDate = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    console.log(chalk.green('当前时间：'), chalk.blue(formattedDate));
    console.log(chalk.green('时间戳（毫秒）：'), chalk.blue(timestamp));
    console.log(chalk.green('Unix时间戳(秒)： '), chalk.blue(unixTimestamp));
}
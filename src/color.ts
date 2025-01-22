import chalk from 'chalk';

export function handleColor(args: string[]) {
    if (args.length === 0) {
        console.log(chalk.yellow('请提供颜色值，例如：'));
        console.log(chalk.blue('my color #ff0000'));
        console.log(chalk.blue('my color rgb(255,0,0)'));
        return;
    }

    const color = args.join(' ').trim();

    // 判断颜色格式
    if (color.startsWith('#')) {
        // HEX to RGB
        const hex = color.replace('#', '');
        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
            console.log(chalk.red('无效的 HEX 颜色格式，应为 #RRGGBB'));
            return;
        }

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        console.log(chalk.green('HEX：'), chalk.hex(color)(color));
        console.log(chalk.green('RGB：'), chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`));

    } else if (color.startsWith('rgb')) {
        // RGB to HEX
        const match = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (!match) {
            console.log(chalk.red('无效的 RGB 颜色格式，应为 rgb(r,g,b)'));
            return;
        }

        const [_, r, g, b] = match.map(Number);

        // 验证 RGB 值范围
        if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
            console.log(chalk.red('RGB 值应在 0-255 范围内'));
            return;
        }

        const hex = '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();

        console.log(chalk.green('RGB：'), chalk.rgb(r, g, b)(color));
        console.log(chalk.green('HEX：'), chalk.hex(hex)(hex));

    } else {
        console.log(chalk.red('不支持的颜色格式，请使用 HEX (#RRGGBB) 或 RGB (rgb(r,g,b))'));
    }
}
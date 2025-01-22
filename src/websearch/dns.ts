import dns from 'dns';
import chalk from 'chalk';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export async function handleDNSLookup(domain: string) {
    try {
        console.log(chalk.green(`正在查询域名 ${domain} 的 DNS 信息...\n`));

        // 获取 A 记录 (IPv4)
        try {
            const ipv4Records = await resolve4(domain);
            console.log(chalk.blue('IPv4 地址:'));
            ipv4Records.forEach(ip => {
                console.log(chalk.yellow(`  → ${ip}`));
            });
        } catch (error) {
            console.log(chalk.yellow('未找到 IPv4 记录'));
        }

        // 获取 AAAA 记录 (IPv6)
        try {
            const ipv6Records = await resolve6(domain);
            console.log(chalk.blue('\nIPv6 地址:'));
            ipv6Records.forEach(ip => {
                console.log(chalk.yellow(`  → ${ip}`));
            });
        } catch (error) {
            console.log(chalk.yellow('未找到 IPv6 记录'));
        }

    } catch (error: any) {
        console.error(chalk.red(`DNS 查询失败: ${error.message}`));
    }
}
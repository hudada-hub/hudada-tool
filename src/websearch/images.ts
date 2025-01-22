import chalk from 'chalk';

const SAMPLE_PNG_URLS = [
    'https://picsum.photos/800/600.png',
    'https://dummyimage.com/600x400/000/fff.png',
    'https://via.placeholder.com/500x300.png',
    'https://source.unsplash.com/random/800x600.png',
    'https://placehold.co/600x400.png',
    'https://fastly.picsum.photos/id/237/500/300.png',
    'https://fastly.picsum.photos/id/238/500/300.png',
    'https://fastly.picsum.photos/id/239/500/300.png',
    'https://fastly.picsum.photos/id/240/500/300.png',
    'https://fastly.picsum.photos/id/241/500/300.png'
];

export function handlePngUrls() {
    console.log(chalk.green('以下是10个示例PNG图片地址:\n'));
    SAMPLE_PNG_URLS.forEach((url, index) => {
        console.log(chalk.blue(`${index + 1}. ${url}`));
    });
}
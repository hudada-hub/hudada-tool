import chalk from 'chalk';

const SAMPLE_MUSIC_URLS = [
    'https://music.163.com/song/media/outer/url?id=1824020873.mp3', // 网易云音乐示例
    'https://music.163.com/song/media/outer/url?id=1824020874.mp3',
    'https://music.163.com/song/media/outer/url?id=1824020875.mp3',
    'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3', // 测试音频
    'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.mp3', // 示例音频
    'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.mp3',
    'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.mp3',
    'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.mp3',
    'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.mp3',
    'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.mp3'
];

export function handleMusicUrls() {
    console.log(chalk.green('以下是10个示例音乐地址:\n'));
    SAMPLE_MUSIC_URLS.forEach((url, index) => {
        console.log(chalk.blue(`${index + 1}. ${url}`));
    });
    console.log(chalk.yellow('\n注意: 部分音乐链接可能需要版权授权才能访问'));
}
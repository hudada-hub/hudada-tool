// 做一个简单的聊天机器人
const chatBot = {
    // 基础回复模板
    responses: {
        greeting: ['你好！', '很高兴见到你！', '你好啊！'],
        farewell: ['再见！', '下次见！', '祝你有愉快的一天！'],
        unknown: ['抱歉，我不太明白。', '能请你换个方式说吗？', '这个问题有点难，我需要想想。']
    },

    // 获取随机回复
    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // 处理用户输入
    processInput(input) {
        input = input.toLowerCase().trim();
        
        // 扩展回复类别
        if (input.includes('你好') || input.includes('嗨') || input.includes('早上好') || input.includes('晚上好')) {
            return this.getRandomResponse('greeting');
        } else if (input.includes('再见') || input.includes('拜拜') || input.includes('回头见')) {
            return this.getRandomResponse('farewell');
        } else if (input.includes('谢谢') || input.includes('感谢')) {
            return '不用谢，这是我应该做的！';
        } else if (input.includes('?') || input.includes('？')) {
            return '这是一个很好的问题，让我想想...';
        } else if (input.includes('天气')) {
            return '抱歉，我还没有接入天气服务，不能告诉你天气情况。';
        } else {
            return this.getRandomResponse('unknown');
        }
    }
};

// 使用示例
function chat() {
    const userInput = prompt('请输入你想说的话：');
    if (userInput === null || userInput === '') {
        return;
    }
    const response = chatBot.processInput(userInput);
    alert(response);
    chat(); // 继续对话
}

// 启动聊天
chat();

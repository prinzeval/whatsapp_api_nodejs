// src/chatbotService.js
import ChatbotAPI from './chatbotAPI.js';

class ChatbotService {
    constructor(api) {
        this.api = api;
    }

    async sendMessageToBot(messageList) {
        console.log('Sending messages:', messageList);
        const response = await this.api.sendMessage(messageList);
        return response;
    }
}

export default ChatbotService;

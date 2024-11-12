import WhatsAppAdapter from './whatsappAdapter.js'; // Use .js extension
// In app.js
import ChatbotService from './ChatbotService.js'; // Use this if your file is named ChatbotService.js

// Utility to track sent messages and ID mappings
const messageStore = new Map(); // Stores {platformId: {chatbotId, platformId, message}}

class MessageController {
    constructor(platform, api, chatbotService) {
        switch (platform) {
            case 'whatsapp':
                this.adapter = new WhatsAppAdapter(api);
                break;
            // Add other platforms as needed
            default:
                throw new Error('Unsupported platform');
        }
        this.chatbotService = chatbotService;
    }

    async handleIncomingMessage(platformMessage) {
        const chatbotMessage = this.adapter.receiveMessage(platformMessage);
        await this.chatbotService.sendMessageToBot([chatbotMessage]);

        const botResponse = await this.chatbotService.getBotResponse();

        botResponse.forEach((response) => {
            // Use the chatbotId to find the original message
            const originalMessage = messageStore.get(response.id);
            if (originalMessage) {
                this.adapter.sendMessage([response]);
            }
        });
    }
}

export default MessageController;

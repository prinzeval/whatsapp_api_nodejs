// src/chatbotAPI.js
class ChatbotAPI {
    async sendMessage(messages) {
        // Simulate a response from the chatbot
        console.log('Sending messages to chatbot API:', messages);
        return {
            status: 'success',
            messages: messages.map(msg => ({ ...msg, response: 'Hi, how can I help you?' })),
        };
    }
}

export default ChatbotAPI; // This should be the default export

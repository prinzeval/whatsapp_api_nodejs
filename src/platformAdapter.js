// src/platformAdapter.js
class PlatformAdapter {
    sendMessage(messageList) {
        throw new Error('sendMessage method must be implemented');
    }
    receiveMessage(platformMessage) {
        throw new Error('receiveMessage method must be implemented');
    }
    transformOutgoingMessage(chatbotMessage) {
        throw new Error('transformOutgoingMessage method must be implemented');
    }
    transformIncomingMessage(platformMessage) {
        throw new Error('transformIncomingMessage method must be implemented');
    }
}

export default PlatformAdapter;

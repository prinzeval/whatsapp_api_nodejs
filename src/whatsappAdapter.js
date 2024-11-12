// src/whatsappAdapter.js
import PlatformAdapter from './platformAdapter.js';

class WhatsAppAdapter extends PlatformAdapter {
    async sendMessage(messageList) {
        console.log('Sending messages to WhatsApp:', messageList);
        const platformResponse = await this.api.send(messageList); // Ensure the send method is called correctly
        console.log('Message sent successfully:', platformResponse);
        return platformResponse;
    }
}

export default WhatsAppAdapter;

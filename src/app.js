require("dotenv").config();
const axios = require('axios');
const express = require('express');
const app = express();
const processStream = require("../processStream");
// WhatsApp API credentials
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const VERIFIED_TOKEN = process.env.VERIFY_TOKEN;
// In-memory storage for conversations
const conversations = new Map();
// Middleware to parse incoming JSON request bodies
app.use(express.json());
// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFIED_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});
async function sendMessageToChatbot(userMessage, recipientNumber) {
    if (!userMessage || !recipientNumber) {
        throw new Error('Missing required parameters: userMessage or recipientNumber');
    }
    try {
        // Get existing conversation or create new one with proper initialization
        let conversationState = conversations.get(recipientNumber);
        if (!conversationState) {
            conversationState = {
                messages: [],
                chatbotConversationId: null
            };
            conversations.set(recipientNumber, conversationState);
        }
        // Ensure messages array exists
        if (!Array.isArray(conversationState.messages)) {
            conversationState.messages = [];
        }
        const messageObject = {
            unuseful: false,
            hiddenFromUser: false,
            role: "user",
            message: userMessage,
        };
        conversationState.messages.push(messageObject);
        const payload = {
            messages: conversationState.messages,
            chatbotConversationId: conversationState.chatbotConversationId,
        };
        console.log('Sending payload to chatbot:', payload);
        const response = await axios.post(
            'https://api.cmnd.ai/chatbots/64/conversations',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
                adapter: "fetch",
            }
        );
        const onData = async (data) => {
            const { messages, chatbotConversationId } = data;
            const lastMessage = messages[messages.length - 1];
            const cmndResponse = lastMessage.message;


            conversationState.messages = messages;
            conversationState.chatbotConversationId = chatbotConversationId;
            conversations.set(recipientNumber, conversationState);

            if (lastMessage && cmndResponse) {
                await sendWhatsAppMessage(cmndResponse, recipientNumber);
            } else {
                throw new Error('No valid response message from chatbot');
            }
        }
        const reader = response.data.pipeThrough(new TextDecoderStream()).getReader();
        await processStream({ reader, onData })



    } catch (error) {
        console.error('Error in sendMessageToChatbot:', error);
        console.error('Error details:', {
            message: error.message,
            recipientNumber,
            conversationState: conversations.get(recipientNumber)
        });
        throw error;
    }
}
async function sendWhatsAppMessage(chatbotReply, recipientNumber) {
    if (!chatbotReply || !recipientNumber) {
        throw new Error('Missing required parameters: chatbotReply or recipientNumber');
    }
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "text",
        text: {
            body: chatbotReply
        }
    };
    try {
        const response = await axios.post(url, data, { headers });
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending WhatsApp message:", {
            error: error.message,
            responseData: error.response?.data,
            recipientNumber
        });
        throw error;
    }
}
// Webhook endpoint to handle incoming messages
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        if (!body || body.object !== 'whatsapp_business_account') {
            return res.sendStatus(404);
        }
        if (!body.entry || !Array.isArray(body.entry)) {
            console.error('Invalid webhook body structure:', body);
            return res.sendStatus(400);
        }
        for (const entry of body.entry) {
            if (!entry.changes || !Array.isArray(entry.changes)) continue;
            for (const change of entry.changes) {
                if (change.field !== 'messages' || !change.value?.messages) continue;
                const message = change.value.messages[0];
                const contact = change.value.contacts?.[0];
                if (!message || message.type !== 'text' || !message.text?.body) {
                    console.log('Skipping non-text message:', message);
                    continue;
                }
                const recipientNumber = contact?.wa_id;
                if (!recipientNumber) {
                    console.error('Missing recipient number for message:', message);
                    continue;
                }
                console.log("Received message from:", contact?.profile?.name || "Unknown");
                console.log("Message content:", message.text.body);
                await sendMessageToChatbot(message.text.body, recipientNumber);
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing webhook:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.sendStatus(500);
    }
});
// Start the server on port 8000
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
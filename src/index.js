require("dotenv").config();
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const processStream = require('../processStream');

// WhatsApp API credentials
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN; // Moved to .env
const phoneNumberId = process.env.PHONE_NUMBER_ID; // Moved to .env
const VERIFIED_TOKEN = process.env.VERIFY_TOKEN; // Your verify token for webhook verification

// Middleware to parse incoming JSON request bodies
app.use(bodyParser.json());

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


const onData=async (data)=>{
    const {messages, chatbotConversationId} = data;
    const lastMessage = messages[messages.length-1];
    const cmndResponse = lastMessage.message;

    await sendWhatsAppMessage(cmndResponse);

}


async function sendMessageToChatbot(userMessage, messagesArray, id) {

    const messageObject = {
            unuseful: false,
            hiddenFromUser: false,
            role: "user",
            message: userMessage,
            
        }
        messagesArray.push(messageObject);
    
    try {
        const payload = {
            messages: messagesArray,
            chatbotConversationId: id,
        };
      

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
        const reader = response.data.pipeThrough(new TextDecoderStream()).getReader();
        await processStream({reader, onData})

    } catch (error) {
        console.error('Error sending message to chatbot:', error.message);
        throw error;
    }
}


// Function to send WhatsApp messages
async function sendWhatsAppMessage(chatbotReply) {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: "whatsapp",
        to: "2348148246314",
        type: "text", // Using text type for the response
        text: {
            body: chatbotReply
        }
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}


// Webhook endpoint to handle incoming messages
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        if (Array.isArray(body.entry)) {
        
            body.entry.forEach(async entry => {
                if (entry.changes && Array.isArray(entry.changes)) {
                    entry.changes.forEach(async change => {
                        if (change.field === 'messages' && change.value.messages) {
                            const message = change.value.messages[0];
                            const contact = change.value.contacts ? change.value.contacts[0] : null;

                            if (message && message.type === 'text') {
                                console.log({message})
                                // Process incoming message
                                const recipientNumber = contact ? contact.wa_id : null; // Capture the recipient's phone number
                                console.log("Received message from:", contact ? contact.profile.name : "Unknown");
                                console.log("Message content:", message.text.body);

                            
                                await sendMessageToChatbot(message.text.body, []);
                                
                            
                            }
                        } else if (change.field === 'statuses') {
                            // Handle message status updates if needed
                            console.log("Received a status update");
                        }
                    });
                }
            });
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Start the server on port 8000
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

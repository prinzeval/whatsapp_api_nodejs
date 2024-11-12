require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');  // Add axios for HTTP requests

const app = express();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;  // Add your WhatsApp API token here

app.use(bodyParser.json());

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Function to get media URL using media ID
async function getMediaUrl(mediaId) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v17.0/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        });
        return response.data.url;
    } catch (error) {
        console.error("Error fetching media URL:", error.response ? error.response.data : error.message);
        return null;
    }
}

// Webhook for receiving messages and media
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        if (Array.isArray(body.entry)) {
            body.entry.forEach(entry => {
                if (entry.changes && Array.isArray(entry.changes)) {
                    entry.changes.forEach(async (change) => {
                        if (change.field === 'messages' && change.value.messages) {
                            const message = change.value.messages[0];
                            const contact = change.value.contacts ? change.value.contacts[0] : null;

                            if (message) {
                                const senderName = contact ? contact.profile.name : "Unknown";
                                console.log("Received message from:", senderName);

                                // Check for message type and handle accordingly
                                if (message.type === 'text') {
                                    console.log("Text Message:", message.text.body);
                                } else if (message.type === 'image') {
                                    const mediaId = message.image.id;
                                    const imageUrl = await getMediaUrl(mediaId);
                                    if (imageUrl) {
                                        console.log("Image URL:", imageUrl);
                                        console.log("Caption:", message.image.caption || "No caption");
                                    } else {
                                        console.log("Failed to retrieve image URL");
                                    }
                                } else if (message.type === 'document') {
                                    const mediaId = message.document.id;
                                    const documentUrl = await getMediaUrl(mediaId);
                                    if (documentUrl) {
                                        console.log("Document URL:", documentUrl);
                                        console.log("File Name:", message.document.filename);
                                        console.log("MIME Type:", message.document.mime_type);
                                    } else {
                                        console.log("Failed to retrieve document URL");
                                    }
                                } else if (message.type === 'video') {
                                    const mediaId = message.video.id;
                                    const videoUrl = await getMediaUrl(mediaId);
                                    if (videoUrl) {
                                        console.log("Video URL:", videoUrl);
                                        console.log("Caption:", message.video.caption || "No caption");
                                    } else {
                                        console.log("Failed to retrieve video URL");
                                    }
                                } else {
                                    console.log("Unsupported message type:", message.type);
                                }
                            }
                        } else if (change.field === 'statuses') {
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

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

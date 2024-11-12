const axios = require('axios');
const processStream = require('./processStream');
const sendWhatsAppMessage = require('./sendWhatsAppMessage');

const readline = require("readline");

let rl = readline.createInterface(
        process.stdin, process.stdout
    );

const onData=async (data)=>{
    const {messages, chatbotConversationId} = data;
    const lastMessage = messages[messages.length-1];
    const cmndResponse = lastMessage.message;

    await sendWhatsAppMessage(recipientNumber, cmndResponse);

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

// Test the function with a sample message
sendMessageToChatbot("Hi how are you?", []);











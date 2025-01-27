const axios = require('axios');

// WhatsApp API credentials
const accessToken = 'EAAIFtsWvcPoBO6Cpy4wP4SYCvwDESnQ2I27VukXRx3DlC1yTp08NP5d31YpZAnw1u6UJbmbfIn6eaZCsGSlUQSJUwcNblMNy7gZC2JHKsqBUZBMzOkNs0DpLsBxra3VlLo8CxK14HBfTMhnHVD9JgQYjirrQVNEMqpc1P8xdF2JBpxqlPTZCZAfwZCZCXfnoPvN7IzZABUMaaDeVmBOueIkti5AZAPDG5kpIYzeXUZD';
const phoneNumberId = '469243756268116';
const recipientNumber = '2348148246314'; // Replace with the target phone number

async function sendWhatsAppMessage() {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "template",
        template: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}

sendWhatsAppMessage();






// TRYING OUT THE SEND MESSAGE TO EHATSAPP IF ITS ACCEPTS IMAGES AND DOCUMENTS OF ANY KIND 


// const axios = require('axios');

// // WhatsApp API credentials
// const accessToken = 'EAAIFtsWvcPoBOzUxC8SnuOUN6LerkZBZCO3kcl0ki8P9khnmfBk1SedcvQJo119ViaWrABv8ZBTlTWOh4eiwRoiYazZC6cmHBUg1nsYftEpgEBuHBplBRn2xcQAJlUzVzoaVzr63pdmwwZCxkZB6WTLtTTk7AzDtBKLrvlK4iKkartSZCYpzZBsuHhYsg8K1m3rLeTqZCzRuuZB2ZAy0vAbrvGnHaX0ppGctdFdA5MZD';
// const phoneNumberId = '469243756268116';
// const recipientNumber = '2348148246314'; // Replace with the target phone number

// async function sendWhatsAppMessage(type, content) {
//     const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
//     const headers = {
//         'Authorization': `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//     };

//     let data = {
//         messaging_product: "whatsapp",
//         to: recipientNumber
//     };

//     // Configure the message based on the type
//     if (type === "template") {
//         data.type = "template";
//         data.template = {
//             name: content.templateName, // E.g., "hello_world"
//             language: {
//                 code: content.languageCode || "en_US" // Default to "en_US" if not provided
//             }
//         };
//     } else if (type === "image") {
//         data.type = "image";
//         data.image = {
//             link: content.link // URL of the image
//         };
//     } else if (type === "document") {
//         data.type = "document";
//         data.document = {
//             link: content.link, // URL of the document (PDF, etc.)
//             filename: content.filename || "document.pdf" // Default filename if not provided
//         };
//     } else {
//         console.error("Unsupported message type");
//         return;
//     }

//     try {
//         const response = await axios.post(url, data, { headers });
//         console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} sent successfully:`, response.data);
//     } catch (error) {
//         console.error(`Error sending ${type}:`, error.response ? error.response.data : error.message);
//     }
// }

// // Example usage:

// // Send a template message
// sendWhatsAppMessage("template", {
//     templateName: "HELLO THIS IS YOUR IMAGE",
//     languageCode: "en_US"
// });

// // Send an image
// sendWhatsAppMessage("image", {
//     link: "https://media.licdn.com/dms/image/v2/D4E03AQGkNTms1QCOnQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1718296943054?e=1735776000&v=beta&t=F8t_dAO4g2zQsGSOvafiKwJmGP59Hei1yTmOXyxGytI" // Replace with your image URL
// });

// // Send a document
// sendWhatsAppMessage("document", {
//     link: "", // Replace with your document URL
//     filename: "example_document.pdf"
// });

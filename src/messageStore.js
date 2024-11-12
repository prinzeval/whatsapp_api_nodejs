// Utility to track sent messages and ID mappings
const messageStore = new Map(); // Stores {platformId: {chatbotId, platformId, message}}

export default messageStore;

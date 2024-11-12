const processStream = async({onData, reader}) => {
    if(!onData) return;
    // let fullAssistantMessage = "";
    let fullMessageContext = "";
    try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
    
          // Process the incoming chunk of data
          const chunk = value;
    
          // Split the chunk by lines
          const lines = chunk.split("\n");
    
          for (const line of lines) {
            let dataString = line;
            if (line.startsWith("data: ")) {
              dataString = line.slice(6);
            }
              try {
                const dataObject = JSON.parse(fullMessageContext + dataString);
                if (dataObject.error) {
                  throw new Error(dataObject.error);
                }
                if (!dataObject.content) {
                 //at this point, the dataObject does not have a content propery
                  //and it is completed
                  //get the last message from the dataObject to check if it is a function call
                  const {
                    messages,
                    completionFinished,
                    finalResponseWithUsageData,
                    chatbotConversationId,
                    conversationId,
                    totalTokens,
                    totalCost,
                  } = dataObject;
    
                  onData({
                    messages,
                    completionFinished,
                    finalResponseWithUsageData,
                    conversationId,
                    chatbotConversationId,
                    totalTokens,
                    totalCost,
                  });
                }
              } catch (error) {
            
              }
            
          }
        }
      } catch (error) {
        throw new Error(error);
      }
}
module.exports = processStream;



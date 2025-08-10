import { HttpRequest } from '@azure/functions';

interface ImageAttachment {
  id: string;
  data: string; // base64 encoded image data
  mimeType: string;
  name: string;
  size: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: ImageAttachment[];
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  max_tokens: number;
}

const httpTrigger = async function (context: any, req: HttpRequest): Promise<void> {
  context.res = {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  } as any;

  try {
    // Parse the request body
    const body: ChatRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const lastMessage = body.messages[body.messages.length - 1];
    
    // Check if the message has images
    const hasImages = lastMessage?.images && lastMessage.images.length > 0;
    
    let responseText = '';
    
    if (hasImages) {
      // Handle messages with images
      responseText = `I can see ${lastMessage.images!.length} image(s) you've shared. `;
      
      // Add description for each image
      lastMessage.images!.forEach((image, index) => {
        responseText += `Image ${index + 1} (${image.name}): This appears to be a ${image.mimeType} file. `;
      });
      
      responseText += `Along with your message: "${lastMessage.content}". `;
      responseText += 'In a real implementation, this would be processed by a vision-capable AI model like Gemini Vision or GPT-4 Vision to provide detailed analysis of the image content.';
    } else {
      // Handle text-only messages
      responseText = `You said: "${lastMessage?.content}". This is a stubbed response from MaatSaab API. `;
      responseText += 'In a real implementation, this would be processed by an AI model like Gemini or GPT to provide intelligent responses.';
    }
    
    // Stream the response character by character
    for (let i = 0; i < responseText.length; i++) {
      context.res?.write?.(responseText[i]);
      await new Promise((r) => setTimeout(r, 20)); // Slightly slower for better effect
    }
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    const errorText = 'Sorry, there was an error processing your request.';
    for (let i = 0; i < errorText.length; i++) {
      context.res?.write?.(errorText[i]);
      await new Promise((r) => setTimeout(r, 10));
    }
  }
  
  context.res?.end?.();
};

export default httpTrigger;

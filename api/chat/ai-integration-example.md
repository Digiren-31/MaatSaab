# AI Integration Example for Image Support

This file shows how to integrate the image attachment feature with real AI services.

## Google Gemini Vision API Integration

```typescript
// Example integration with Google Gemini Vision API
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGeminiWithImages(messages: ChatMessage[], apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.images && lastMessage.images.length > 0) {
    // Convert base64 images to the format Gemini expects
    const imageParts = lastMessage.images.map(image => ({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    }));

    // Create the prompt with text and images
    const result = await model.generateContent([
      lastMessage.content,
      ...imageParts
    ]);

    return result.response.text();
  } else {
    // Text-only conversation
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }
}
```

## OpenAI GPT-4 Vision API Integration

```typescript
// Example integration with OpenAI GPT-4 Vision API
import OpenAI from 'openai';

async function callOpenAIWithImages(messages: ChatMessage[], apiKey: string) {
  const openai = new OpenAI({ apiKey });

  // Convert our message format to OpenAI format
  const openaiMessages = messages.map(msg => {
    if (msg.images && msg.images.length > 0) {
      return {
        role: msg.role,
        content: [
          { type: "text", text: msg.content },
          ...msg.images.map(image => ({
            type: "image_url",
            image_url: {
              url: `data:${image.mimeType};base64,${image.data}`
            }
          }))
        ]
      };
    } else {
      return {
        role: msg.role,
        content: msg.content
      };
    }
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: openaiMessages,
    max_tokens: 512,
    stream: true
  });

  return completion;
}
```

## Claude 3 Vision API Integration

```typescript
// Example integration with Anthropic Claude 3 Vision API
import Anthropic from '@anthropic-ai/sdk';

async function callClaudeWithImages(messages: ChatMessage[], apiKey: string) {
  const anthropic = new Anthropic({ apiKey });

  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.images && lastMessage.images.length > 0) {
    const content = [
      { type: "text", text: lastMessage.content },
      ...lastMessage.images.map(image => ({
        type: "image",
        source: {
          type: "base64",
          media_type: image.mimeType,
          data: image.data
        }
      }))
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 512,
      messages: [
        ...messages.slice(0, -1).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: content
        }
      ]
    });

    return response.content[0].text;
  }
}
```

## Usage in API Handler

```typescript
// Update the main API handler to use real AI services
const httpTrigger = async function (context: any, req: HttpRequest): Promise<void> {
  // ... setup code ...

  try {
    const body: ChatRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Choose your AI service
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    let responseText: string;
    
    if (process.env.GEMINI_API_KEY) {
      responseText = await callGeminiWithImages(body.messages, process.env.GEMINI_API_KEY);
    } else if (process.env.OPENAI_API_KEY) {
      const stream = await callOpenAIWithImages(body.messages, process.env.OPENAI_API_KEY);
      // Handle streaming response...
    }

    // Stream the response
    for (let i = 0; i < responseText.length; i++) {
      context.res?.write?.(responseText[i]);
      await new Promise((r) => setTimeout(r, 20));
    }
    
  } catch (error) {
    // Handle errors...
  }
  
  context.res?.end?.();
};
```

## Environment Variables

Add these to your `.env` file or Azure Functions configuration:

```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

## Installation

Install the required packages:

```bash
npm install @google/generative-ai openai @anthropic-ai/sdk
```

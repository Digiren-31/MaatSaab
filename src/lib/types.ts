export type Role = 'system' | 'user' | 'assistant';

export interface ImageAttachment {
  id: string;
  data: string; // base64 encoded image data
  mimeType: string;
  name: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  images?: ImageAttachment[];
  createdAt: number;
}

export interface ChatRequestBody {
  messages: { role: Role; content: string; images?: ImageAttachment[] }[];
  model: string;
  temperature: number;
  max_tokens: number;
}

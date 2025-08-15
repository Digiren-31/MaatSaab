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

export type EducationLevel = 
  | 'primary'
  | 'junior-high' 
  | 'high-school'
  | 'intermediate'
  | 'graduation'
  | 'post-graduation';

export interface TargetExamination {
  id: string;
  name: string;
  description: string;
  educationLevels: EducationLevel[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  educationLevel: EducationLevel | null;
  targetExaminations: string[]; // Array of exam IDs
  profileCompleted: boolean;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}

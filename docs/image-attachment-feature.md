# Image Attachment Feature - MaatSaab

## Overview

The image attachment feature allows users to upload and send images along with text messages to the AI assistant. This feature supports multiple image formats and provides a clean, intuitive interface for managing image attachments.

## Features

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit
- Maximum file size: 10MB per image
- Multiple images can be attached to a single message

### User Interface Components

#### 1. Image Upload Button
- Located in the composer area next to the Send button
- Uses a paperclip icon to indicate attachment functionality
- Clicking opens the native file picker

#### 2. Image Preview
- Shows thumbnails of attached images before sending
- Displays image name and file size
- Individual remove buttons for each attachment
- Responsive grid layout

#### 3. Message Display
- Images are displayed within user message bubbles
- Click to enlarge functionality
- Preserves aspect ratio and quality

## Technical Implementation

### Data Structure

```typescript
interface ImageAttachment {
  id: string;
  data: string; // base64 encoded image data
  mimeType: string;
  name: string;
  size: number;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  images?: ImageAttachment[];
  createdAt: number;
}
```

### Key Functions

#### Image Processing
```typescript
// Converts File object to base64 encoded string
export function encodeImageAsBase64(file: File): Promise<string>

// Handles file upload validation and processing
const handleImageUpload = async (files: FileList | null)

// Removes an image from the attachment list
const removeImage = (imageId: string)
```

#### Message Handling
- Images are included in the message payload sent to the API
- The conversation history preserves image data
- Images persist in localStorage with conversations

### API Integration

The API endpoint receives messages with the following structure:

```typescript
{
  "messages": [
    {
      "role": "user",
      "content": "What do you see in this image?",
      "images": [
        {
          "id": "uuid",
          "data": "base64-encoded-image-data",
          "mimeType": "image/jpeg",
          "name": "photo.jpg",
          "size": 1234567
        }
      ]
    }
  ],
  "model": "gemini-2.0-flash",
  "temperature": 0.7,
  "max_tokens": 512
}
```

## Real AI Integration Examples

### Google Gemini Vision
```typescript
const imageParts = images.map(image => ({
  inlineData: {
    data: image.data,
    mimeType: image.mimeType
  }
}));

const result = await model.generateContent([
  textPrompt,
  ...imageParts
]);
```

### OpenAI GPT-4 Vision
```typescript
const content = [
  { type: "text", text: textPrompt },
  ...images.map(image => ({
    type: "image_url",
    image_url: {
      url: `data:${image.mimeType};base64,${image.data}`
    }
  }))
];
```

## Usage Instructions

1. **Upload Images**: Click the paperclip icon in the composer
2. **Select Files**: Choose one or more image files from your device
3. **Preview**: Review attached images in the preview area
4. **Remove**: Click the X button on any image to remove it
5. **Send**: Click Send to submit your message with images
6. **View**: Images appear in your message bubble and in conversation history

## Styling and Responsive Design

### Desktop Experience
- Clean grid layout for image previews
- Hover effects for better interactivity
- Optimized spacing and sizing

### Mobile Experience
- Responsive image grid
- Touch-friendly remove buttons
- Appropriate sizing for smaller screens

### CSS Classes
- `.imageAttachments` - Container for attachment previews
- `.imageAttachment` - Individual attachment preview
- `.attachmentPreview` - Image thumbnail
- `.messageImages` - Container for images in messages
- `.messageImageDisplay` - Individual message image display

## Error Handling

### File Validation
- File type validation with user-friendly error messages
- File size validation with 10MB limit
- Graceful handling of processing errors

### Network Resilience
- Images are preserved during network interruptions
- Retry capability for failed uploads
- Proper error messaging for users

## Performance Considerations

### Image Optimization
- Base64 encoding for easy transmission
- Client-side compression could be added
- Lazy loading for message history images

### Memory Management
- Images are cleaned up when removed
- Conversation data includes image cleanup
- Efficient storage in localStorage

## Security Considerations

### File Upload Security
- Client-side file type validation
- File size limits to prevent abuse
- Base64 encoding for safe transmission

### Data Storage
- Images stored as base64 in localStorage
- No server-side storage in current implementation
- Consider encryption for sensitive images

## Future Enhancements

### Potential Improvements
1. **Image Compression**: Automatic compression before upload
2. **Multiple Formats**: Support for additional image formats
3. **Drag & Drop**: Drag and drop interface for easier uploads
4. **Image Editing**: Basic editing tools (crop, resize, rotate)
5. **Cloud Storage**: Integration with cloud storage services
6. **OCR Support**: Text extraction from images
7. **Image Search**: Search conversations by image content

### Performance Optimizations
1. **Lazy Loading**: Load images only when visible
2. **Thumbnail Generation**: Create smaller thumbnails for previews
3. **Progressive Loading**: Load images progressively
4. **Caching**: Implement smart caching strategies

## Accessibility

### Features Implemented
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus management for interactive elements

### Additional Considerations
- Alt text generation for uploaded images
- Voice description of image content
- Keyboard shortcuts for image operations

## Testing

### Manual Testing Checklist
- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Remove individual images
- [ ] Send message with images
- [ ] View images in conversation history
- [ ] Test file size limits
- [ ] Test unsupported file types
- [ ] Test mobile responsiveness
- [ ] Test accessibility features

### Automated Testing
Consider implementing automated tests for:
- File upload validation
- Image processing functions
- API payload structure
- UI component rendering
- Error handling scenarios

## Troubleshooting

### Common Issues
1. **Images not displaying**: Check file format and size
2. **Upload failures**: Verify network connection and file permissions
3. **Performance issues**: Clear browser cache and check available memory
4. **Mobile issues**: Test touch interactions and responsive layout

### Debug Information
- Check browser console for JavaScript errors
- Verify network requests in browser dev tools
- Test with different image formats and sizes
- Validate API response structure

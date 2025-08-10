import base64
import requests
import json
from typing import List, Dict, Any

class ImageChatAPI:
    """
    Example integration with Gemini Vision API similar to the reference code provided.
    This shows how the image attachment feature would work with real AI services.
    """
    
    def __init__(self, api_key: str, api_url: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"):
        self.api_key = api_key
        self.api_url = api_url
    
    def encode_image_from_file(self, image_path: str) -> tuple[str, str]:
        """
        Encode image file as base64 (similar to the frontend implementation).
        Returns (base64_data, mime_type)
        """
        import mimetypes
        
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith('image/'):
            raise ValueError(f"Unsupported file type: {mime_type}")
        
        # Encode as base64
        with open(image_path, "rb") as img_file:
            encoded_image = base64.b64encode(img_file.read()).decode("utf-8")
        
        return encoded_image, mime_type
    
    def create_gemini_payload(self, text_prompt: str, images: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create payload compatible with Gemini API format.
        Images should be in the format: [{"data": "base64_string", "mimeType": "image/jpeg"}]
        """
        contents = []
        
        # Add text content
        if text_prompt.strip():
            contents.append({"text": text_prompt})
        
        # Add image contents
        for image in images:
            contents.append({
                "inlineData": {
                    "mimeType": image["mimeType"],
                    "data": image["data"]
                }
            })
        
        return {
            "contents": [{
                "parts": contents
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 512
            }
        }
    
    def send_chat_with_images(self, text_prompt: str, images: List[Dict[str, Any]]) -> str:
        """
        Send chat request with images to Gemini API.
        Similar structure to the reference code but adapted for Gemini format.
        """
        # Prepare the payload
        payload = self.create_gemini_payload(text_prompt, images)
        
        # Send the request
        headers = {
            "Content-Type": "application/json"
        }
        
        # Add API key to URL (Gemini uses URL parameter instead of header)
        url_with_key = f"{self.api_url}?key={self.api_key}"
        
        response = requests.post(url_with_key, json=payload, headers=headers)
        
        # Handle the response
        if response.status_code == 200:
            result = response.json()
            if "candidates" in result and len(result["candidates"]) > 0:
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                return content
            else:
                return "No response generated"
        else:
            raise Exception(f"Error: {response.status_code}, {response.text}")

# Example usage similar to the reference code
def example_usage():
    """
    Example showing how to use the ImageChatAPI class.
    This mimics the structure from the reference code you provided.
    """
    
    # Initialize the API (replace with your actual API key)
    api_key = "YOUR_GEMINI_API_KEY"
    chat_api = ImageChatAPI(api_key)
    
    try:
        # Encode images from files
        image1_data, image1_mime = chat_api.encode_image_from_file("image1.jpg")
        image2_data, image2_mime = chat_api.encode_image_from_file("image2.png")
        
        # Prepare images in the format expected by our frontend
        images = [
            {
                "data": image1_data,
                "mimeType": image1_mime,
                "name": "image1.jpg"
            },
            {
                "data": image2_data,
                "mimeType": image2_mime,
                "name": "image2.png"
            }
        ]
        
        # Send request with text and images
        text_prompt = "Describe the content of these images and compare them."
        response = chat_api.send_chat_with_images(text_prompt, images)
        
        print("AI Response:")
        print(response)
        
    except Exception as e:
        print(f"Error: {e}")

# Alternative implementation for OpenAI GPT-4 Vision
class OpenAIChatAPI:
    """
    Example integration with OpenAI GPT-4 Vision API.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.openai.com/v1/chat/completions"
    
    def send_chat_with_images(self, text_prompt: str, images: List[Dict[str, Any]]) -> str:
        """
        Send chat request to OpenAI GPT-4 Vision API.
        """
        # Prepare content with text and images
        content = [{"type": "text", "text": text_prompt}]
        
        # Add images
        for image in images:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{image['mimeType']};base64,{image['data']}"
                }
            })
        
        # Prepare the payload
        payload = {
            "model": "gpt-4-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": content
                }
            ],
            "max_tokens": 512
        }
        
        # Send the request
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(self.api_url, json=payload, headers=headers)
        
        # Handle the response
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            raise Exception(f"Error: {response.status_code}, {response.text}")

# Integration example for the MaatSaab backend
def integrate_with_maatsaab_backend(messages: List[Dict[str, Any]], api_service: str = "gemini") -> str:
    """
    Example of how to integrate this with the MaatSaab backend API.
    This function could be used in the Azure Functions backend.
    """
    
    # Get the last message
    last_message = messages[-1] if messages else None
    if not last_message:
        return "No message provided"
    
    # Check if message has images
    has_images = "images" in last_message and last_message["images"]
    
    if has_images:
        # Use appropriate API service
        if api_service == "gemini":
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return "Gemini API key not configured"
            
            chat_api = ImageChatAPI(api_key)
            return chat_api.send_chat_with_images(
                last_message["content"], 
                last_message["images"]
            )
        
        elif api_service == "openai":
            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                return "OpenAI API key not configured"
            
            chat_api = OpenAIChatAPI(api_key)
            return chat_api.send_chat_with_images(
                last_message["content"], 
                last_message["images"]
            )
    
    else:
        # Handle text-only message with regular chat API
        return handle_text_only_message(messages, api_service)

def handle_text_only_message(messages: List[Dict[str, Any]], api_service: str) -> str:
    """
    Handle text-only messages (existing functionality).
    """
    # This would use the existing text-only chat implementation
    return f"Text-only response for: {messages[-1]['content']}"

if __name__ == "__main__":
    example_usage()

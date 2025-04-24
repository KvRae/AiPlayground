import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages]);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setApiKeySet(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() && !selectedImage) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage,
      image: imagePreview
    };

    setMessages([...messages, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);

      // For text-only messages
      if (!selectedImage) {
        // Use the model name from the text input
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(inputMessage);
        const response = await result.response;
        const text = response.text();

        setMessages(prev => [...prev, {
          role: 'model',
          content: text
        }]);
      } 
      // For messages with images
      else {
        // For images, we need to use a vision-capable model
        // All Gemini models in our dropdown support multimodal capabilities
        // But for consistency, we'll use gemini-1.5-flash for image processing
        const visionModel = 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: visionModel });

        // Convert base64 image to binary
        const base64Data = imagePreview.split(',')[1];
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }

        // Create image part
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: selectedImage.type
          }
        };

        // Create content parts with text and image
        const parts = [
          { text: inputMessage || "What's in this image?" },
          imagePart
        ];

        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const response = await result.response;
        const text = response.text();

        setMessages(prev => [...prev, {
          role: 'model',
          content: text
        }]);

        // Clear image after sending
        removeImage();
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: `Error: ${error.message || 'Failed to generate response'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {!apiKeySet ? (
        <div className="api-key-container">
          <h1>Gemini AI Chat</h1>
          <p>Enter your Gemini API key to start chatting</p>
          <form onSubmit={handleApiKeySubmit}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              required
            />
            <button type="submit">Start Chatting</button>
          </form>
          <p className="api-info">
            You can get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
          </p>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h2>Gemini AI Chat</h2>
            <div className="header-controls">
              <div className="model-selector">
                <label htmlFor="model-select">Model:</label>
                <select
                  id="model-select"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
                </select>
                <div className="model-info" style={{ fontSize: '0.8rem', color: 'white', marginTop: '2px', fontWeight: '500' }}>
                  <a href="https://aistudio.google.com/app/plan_information" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                    View billing information
                  </a>
                </div>
                {selectedImage && (
                  <div className="model-info" style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                    Image detected: Will use gemini-1.5-flash for vision capabilities
                  </div>
                )}
              </div>
              <button onClick={() => setApiKeySet(false)} className="change-key-btn">
                Change API Key
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h3>Welcome to Gemini AI Chat!</h3>
                <p>Start a conversation or upload an image to chat about.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'} ${message.role === 'error' ? 'error-message' : ''}`}
                >
                  <div className="message-header">
                    {message.role === 'user' ? 'You' : message.role === 'error' ? 'Error' : 'Gemini AI'}
                  </div>
                  <div className="message-content">
                    {message.image && (
                      <div className="message-image">
                        <img src={message.image} alt="User uploaded" />
                      </div>
                    )}
                    <div className="message-text">
                      {message.role === 'model' ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message ai-message loading">
                <div className="message-header">Gemini AI</div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="input-container">
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button type="button" onClick={removeImage} className="remove-image-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            <div className="input-row">
              <label htmlFor="image-upload" className="image-upload-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
              />

              <button type="submit" disabled={isLoading || (!inputMessage.trim() && !selectedImage)}>
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

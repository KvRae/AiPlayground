import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import './App.css';

// Navigation bar component
const TopNav = ({ onBack, showBackButton, currentView, onLogoClick, theme, toggleTheme }) => (
  <nav className="top-nav">
    <div className="nav-left">
      {showBackButton && (
        <button onClick={onBack} className="nav-back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{currentView === 'chat' ? 'Change API Key' : 'Back to Home'}</span>
        </button>
      )}
      <div className="nav-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>aiplayground</div>
    </div>
    <div className="nav-right">
      <button onClick={toggleTheme} className="theme-toggle-button">
        {theme === 'light' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <a href="https://github.com/KvRae/AiPlayground" target="_blank" rel="noopener noreferrer" className="repo-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.5 21.278 9.5 21.017C9.5 20.778 9.492 20.055 9.489 19.191C6.728 19.79 6.139 17.81 6.139 17.81C5.685 16.594 5.028 16.29 5.028 16.29C4.132 15.633 5.097 15.646 5.097 15.646C6.094 15.719 6.628 16.712 6.628 16.712C7.521 18.295 8.97 17.858 9.52 17.608C9.611 16.931 9.87 16.495 10.154 16.243C7.93 15.99 5.596 15.116 5.596 11.324C5.596 10.224 6.007 9.324 6.648 8.622C6.545 8.373 6.183 7.379 6.748 6.038C6.748 6.038 7.587 5.773 9.477 7.031C10.292 6.812 11.152 6.702 12.006 6.699C12.86 6.702 13.72 6.812 14.536 7.031C16.424 5.773 17.261 6.038 17.261 6.038C17.827 7.379 17.465 8.373 17.362 8.622C18.005 9.324 18.412 10.224 18.412 11.324C18.412 15.127 16.073 15.987 13.842 16.234C14.196 16.543 14.514 17.154 14.514 18.084C14.514 19.412 14.502 20.682 14.502 21.017C14.502 21.281 14.66 21.587 15.169 21.487C19.138 20.161 22 16.416 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  </nav>
);

function App() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [rememberApiKey, setRememberApiKey] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [theme, setTheme] = useState('dark');
  const messagesEndRef = useRef(null);

  // Determine current view for navigation
  const getCurrentView = () => {
    if (showLandingPage) return 'landing';
    if (!apiKeySet) return 'apiKey';
    return 'chat';
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    const currentView = getCurrentView();
    if (currentView === 'chat') {
      // From chat to API key input
      setApiKeySet(false);
    } else if (currentView === 'apiKey') {
      // From API key input to landing page
      setShowLandingPage(true);
    }
  };

  // Check for saved API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeySet(true);
    }
  }, []);

  // Check for saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply theme class to document body
    document.body.className = theme;
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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
      if (rememberApiKey) {
        localStorage.setItem('geminiApiKey', apiKey);
      } else {
        localStorage.removeItem('geminiApiKey');
      }
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
    <div className={`App ${theme}`}>
      {showLandingPage ? (
        <div className="landing-page-container full-page">
          <TopNav 
            showBackButton={false} 
            currentView="landing" 
            onBack={handleBackNavigation}
            onLogoClick={() => setShowLandingPage(true)}
            theme={theme}
            toggleTheme={toggleTheme} />

          <div className="landing-header">
            <h1>Experience the Future of AI</h1>
            <p className="landing-description">
              Unleash the potential of AI with our interactive playground. Chat with advanced language models, 
              analyze images, and discover the limitless possibilities of artificial intelligence.
            </p>
            <button className="hero-cta-button" onClick={() => setShowLandingPage(false)}>
              Start Exploring Now
            </button>
          </div>

          <div className="app-description">
            <h2>What is AI Playground?</h2>
            <p>
              AI Playground is an interactive platform that allows you to experiment with various AI models.
              You can chat with different language models, test their capabilities, and explore the future of AI technology.
            </p>
            <p>
              Whether you're a developer, researcher, or just curious about AI, our platform provides a simple interface
              to interact with state-of-the-art language models.
            </p>
          </div>

          <div className="models-section">
            <h2 className="models-title">Available Models</h2>
            <div className="models-container">
              <div className="model-card" onClick={() => setShowLandingPage(false)}>
                <h3>Gemini</h3>
                <p>Google's powerful AI model with advanced reasoning and multimodal capabilities.</p>
                <button className="model-button">Get Started</button>
              </div>

              <div className="model-card disabled">
                <h3>ChatGPT</h3>
                <p>OpenAI's conversational AI model known for its natural language understanding.</p>
                <button className="model-button disabled-button">Coming Soon</button>
              </div>

              <div className="model-card disabled">
                <h3>DeepSeek</h3>
                <p>Advanced AI model with specialized knowledge processing capabilities.</p>
                <button className="model-button disabled-button">Coming Soon</button>
              </div>

              <div className="model-card disabled">
                <h3>Claude</h3>
                <p>Anthropic's helpful, harmless, and honest AI assistant.</p>
                <button className="model-button disabled-button">Coming Soon</button>
              </div>
            </div>
          </div>

          <footer className="landing-footer">
            <p>© 2025 AI Playground. All rights reserved.</p>
            <p>Created by <a href="https://kvrae.github.io/" target="_blank" rel="noopener noreferrer">kvrae</a> using <a href="https://www.jetbrains.com/junie/" target="_blank" rel="noopener noreferrer">Junie by JetBrains</a></p>
          </footer>
        </div>
      ) : !apiKeySet ? (
        <div className="api-key-container">
          <div className="api-key-content">
            <div className="api-key-title">
              <div className="api-logo" onClick={() => setShowLandingPage(true)} style={{ cursor: 'pointer' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>Gemini AI Chat</h1>
              <p className="api-key-subtitle">Enter your API key to start your AI conversation</p>
              <button onClick={() => setShowLandingPage(true)} className="back-to-home-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Back to Home</span>
              </button>
            </div>

            <div className="api-key-main-content">
              <form onSubmit={handleApiKeySubmit} className="api-key-form">
                <div className="input-field-container">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 11H5V21H19V11Z" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 9V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V9" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Gemini API key here"
                    required
                    className="api-key-input"
                  />
                </div>

                <div className="remember-key-option">
                  <label className="remember-key-label">
                    <input
                      type="checkbox"
                      checked={rememberApiKey}
                      onChange={(e) => setRememberApiKey(e.target.checked)}
                      className="remember-checkbox"
                    />
                    <span className="checkbox-text">Remember my API key</span>
                  </label>
                  <small className="remember-key-note">
                    (Only check this on your personal device)
                  </small>
                </div>

                <button type="submit" className="start-button">
                  <span>Start Chatting</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

              <div className="api-info">
                <div className="api-info-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2"/>
                    <path d="M12 16V12" stroke={theme === 'dark' ? "#64b5f6" : "#1a73e8"} strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="8" r="1" fill={theme === 'dark' ? "#64b5f6" : "#1a73e8"}/>
                  </svg>
                  <p><strong>How to get your API key:</strong></p>
                </div>
                <ol className="api-steps">
                  <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it here</li>
                </ol>
                <div className="api-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={theme === 'dark' ? "#aaa" : "#666"} strokeWidth="2"/>
                    <path d="M12 8V12" stroke={theme === 'dark' ? "#aaa" : "#666"} strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill={theme === 'dark' ? "#aaa" : "#666"}/>
                  </svg>
                  <small>Your API key is only stored in your browser's local storage and is never sent to our servers.</small>
                </div>
              </div>
            </div>
          </div>

          <footer className="landing-footer">
            <p>© 2025 AI Playground. All rights reserved.</p>
            <p>Created by <a href="https://kvrae.github.io/" target="_blank" rel="noopener noreferrer">kvrae</a> using <a href="https://www.jetbrains.com/junie/" target="_blank" rel="noopener noreferrer">Junie by JetBrains</a></p>
          </footer>
        </div>
      ) : (
        <div className="chat-container">
          <TopNav 
            showBackButton={true} 
            currentView="chat" 
            onBack={handleBackNavigation}
            onLogoClick={() => setShowLandingPage(true)}
            theme={theme}
            toggleTheme={toggleTheme} />
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
                <div className="model-info" style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#e0e0e0' : 'white', marginTop: '2px', fontWeight: '500' }}>
                  <a href="https://aistudio.google.com/app/plan_information" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? '#64b5f6' : 'white' }}>
                    View billing information
                  </a>
                </div>
                {selectedImage && (
                  <div className="model-info" style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#aaaaaa' : '#666', marginTop: '2px' }}>
                    Image detected: Will use gemini-1.5-flash for vision capabilities
                  </div>
                )}
              </div>
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

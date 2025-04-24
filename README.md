# Gemini AI Playground

A React-based chat application that allows you to interact with Google's Gemini AI models. This application supports both text conversations and image analysis using Gemini's multimodal capabilities.

<!-- Add a screenshot of your application here -->
<!-- ![Gemini AI Playground Screenshot](public/screenshot.png) -->

## Features

- Chat with various Gemini AI models (Gemini 2.0 Flash, Gemini 1.5 Pro, etc.)
- Upload and analyze images
- Markdown rendering for AI responses
- Model selection for different use cases
- Responsive design for desktop and mobile use

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd AiPlayground
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Getting a Gemini API Key

To use this application, you'll need a Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to use in the application

## Usage

1. When you first open the application, you'll be prompted to enter your Gemini API key.
   - You can choose to remember your API key for future sessions by checking the "Remember my API key" option
   - This is convenient for personal devices but should be used with caution on shared computers
2. After entering your API key, you can:
   - Type messages to chat with the AI
   - Select different Gemini models from the dropdown menu
   - Upload images for analysis by clicking the image icon
   - View the AI's responses in real-time
   - Change your API key at any time using the "Change API Key" button (this will also clear any saved API key)

## Supported Models

The application supports the following Gemini models:
- Gemini 2.0 Flash
- Gemini 2.0 Flash Lite
- Gemini 1.5 Pro
- Gemini 1.5 Flash
- Gemini 1.5 Flash-8B

Different models have different capabilities and pricing. For more information, visit the [Google AI Studio pricing page](https://aistudio.google.com/app/plan_information).

## Image Analysis

When you upload an image, the application automatically uses a vision-capable model (Gemini 1.5 Flash) to analyze the image, regardless of which model is selected in the dropdown.

## Building for Production

To build the application for production:

```
npm run build
```

This creates an optimized production build in the `build` folder that you can deploy to a web server.

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions. When you push changes to the `main` branch, the following happens:

1. GitHub Actions workflow is triggered
2. The code is checked out
3. Node.js environment is set up
4. Dependencies are installed
5. The application is built
6. The build is deployed to the `gh-pages` branch
7. GitHub Pages serves the content from the `gh-pages` branch

You can view the deployed application at: [https://KvRae.github.io/AiPlayground](https://KvRae.github.io/AiPlayground)

### Troubleshooting Deployment

If you encounter issues with the deployment:

1. Check the Actions tab in your GitHub repository to see if the workflow completed successfully
2. Ensure your repository has GitHub Pages enabled and is set to deploy from the `gh-pages` branch
3. Verify that the `homepage` field in `package.json` matches your GitHub Pages URL
4. Check if your repository has the necessary permissions for GitHub Actions to deploy to GitHub Pages

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App configuration

## Technologies Used

- React
- Google Generative AI SDK
- React Markdown
- CSS for styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- Powered by [Google's Gemini AI](https://deepmind.google/technologies/gemini/)

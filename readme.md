# OpenRouter API Chrome Extension
![image](https://github.com/user-attachments/assets/2bda7c84-c453-48b7-bb40-46823dec9eab)

This Chrome extension enhances user interaction by providing a contextual menu for selected text, allowing users to send text queries to AI models via OpenRouter API and receive responses in a modal window.

## Features
- Select text on a webpage and trigger the extension
- Choose from multiple AI models to process queries
- Toggle between streaming and non-streaming responses
- Enable fast mode to process multiple models simultaneously
- Drag and reposition the response modal
- Copy responses easily to the clipboard

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/your-repo/openrouter-chrome-extension.git
   cd openrouter-chrome-extension
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Build the extension:
   ```sh
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right corner)
   - Click "Load unpacked"
   - Select the `dist` folder inside the cloned repository

## Configuration

Before using the extension, you need to provide an OpenRouter API key:

1. Open `content.js` and replace the empty API key:
   ```js
   const apiKey = "sk-or-your-api-key-here";
   ```
2. Save the file and reload the extension in Chrome.

## Supported AI Models
The extension allows selecting from the following models:

- **DeepSeek V3** (`deepseek/deepseek-chat`)
- **GPT-4o Mini** (`gpt-4o-mini`)
- **DeepSeek R1** (`deepseek/deepseek-r1-distill-llama-70b`)
- **Gemini 2.0** (`google/gemini-2.0-flash-thinking-exp:free`)
- **Meta Lama 3.1** (`meta-llama/llama-3.1-70b-instruct`)
- **Qwen2.5** (`eva-unit-01/eva-qwen-2.5-72b`)

## Usage
1. Select text on a webpage.
2. If enabled, a floating button appears next to the selection.
3. Click the button to open the modal.
4. Choose an AI model and toggle options (fast mode, streaming).
5. Click "Send" to process the request and view the response.
6. Copy the response if needed.

## Development
For modifications, install dependencies and use:
```sh
npm run dev
```
This runs the project in development mode with automatic rebuilding.

## License
MIT License. See `LICENSE` file for details.


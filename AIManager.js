// AIManager.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIManager {
    constructor() {
        // !!! IMPORTANT SECURITY WARNING !!!
        // The API key below is a placeholder. If you replace it with a real API key
        // and deploy this code to a client-side application (runs in the browser),
        // your API key will be exposed and can be misused, potentially incurring charges.
        // For production, use a secure backend proxy to make API calls.
        // Do NOT commit your real API key to version control.
        this.apiKey = "YOUR_GEMINI_API_KEY_HERE";

        this.genAI = null;
        this.isReady = false;

        if (this.apiKey === "YOUR_GEMINI_API_KEY_HERE" || !this.apiKey) {
            console.warn("AI Manager: API key is a placeholder or missing. SDK will not be initialized. Please provide a valid API key.");
            this.isReady = false;
        } else {
            try {
                this.genAI = new GoogleGenerativeAI(this.apiKey);
                this.isReady = true;
                console.log("MANAGER: AIManager constructor called. Configured for Google Gemini API via @google/genai SDK.");
            } catch (error) {
                console.error("AI Manager: Error initializing GoogleGenerativeAI SDK. Ensure API key is valid and SDK is loaded/installed.", error);
                this.isReady = false;
                this.genAI = null;
            }
        }
    }

    async generateDialogue(prompt_text) {
        if (!this.isReady || !this.genAI) {
            console.warn("AI Manager: generateDialogue called but SDK not ready (SDK not initialized or API key missing/placeholder).");
            return "AI system not ready (SDK not initialized or API key missing/placeholder).";
        }

        console.log("AI Manager: Generating dialogue via @google/genai SDK with prompt:", prompt_text);
        const modelId = "gemini-2.5-flash-lite-preview-06-17";

        try {
            const model = this.genAI.getGenerativeModel({ model: modelId });
            // For a single string prompt, sending it directly is simplest.
            // The SDK will wrap it as { role: "user", parts: [{ text: prompt_text }] }
            // To include generationConfig (like temperature, maxOutputTokens), it would be:
            // const generationConfig = {
            //   temperature: 0.85,
            //   maxOutputTokens: 55,
            // };
            // const result = await model.generateContent({
            //   contents: [{ role: "user", parts: [{ text: prompt_text }] }],
            //   generationConfig,
            // });
            // For simplicity as per current instructions, sending prompt_text directly:
            const result = await model.generateContent(prompt_text);
            const response = result.response;

            if (!response) {
                console.error("AI Manager: Gemini SDK returned an undefined response. Full result:", result);
                return "My mind just blanked, man. (SDK Error: Empty response)";
            }

            const generatedText = response.text();

            console.log("AI Manager: Gemini SDK generated text:", generatedText);
            return generatedText.trim();
        } catch (error) {
            console.error("AI Manager: Error during @google/genai SDK call:", error);
            const errorMessage = error.message || "Unknown error during API call.";
            return `My mind just blanked, man. (SDK Error: ${errorMessage})`;
        }
    }
}

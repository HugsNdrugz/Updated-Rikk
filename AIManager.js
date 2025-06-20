// AIManager.js
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2';

export class AIManager {
    constructor() {
        this.generator = null;
        this.isReady = false;
        console.log("MANAGER: AIManager constructor called.");
    }

    async init() {
        console.log("AI Manager: Initializing AI model... This may take some time depending on model size and connection speed.");
        try {
            const progressCallback = (progress) => { console.log('AI Manager: Model loading progress:', progress); };
            this.generator = await pipeline('text-generation', 'onnx-community/Phi-3.5-mini-instruct-onnx-web', { progress_callback: progressCallback });
            console.log('AI Manager: Pipeline assignment complete. Generator object:', this.generator);
            this.isReady = true;
            console.log("AI Manager: Model loaded and ready!");
            document.dispatchEvent(new CustomEvent('aiReady'));
        } catch (error) {
            console.log("AI Manager: Full model initialization FAILED in try block.");
            console.error("AI Manager: Failed to load model.", error);
        }
    }

    async generateDialogue(messages) {
        if (!this.isReady) {
            console.warn("AI Manager: generateDialogue called before model was ready.");
            return "Uh... what was I saying?";
        }

        console.log("AI Manager: Starting text generation...");
        console.log("AI Manager: Generating dialogue with messages:", messages);
        try {
            const output = await this.generator(messages, { max_new_tokens: 256, do_sample: false });
            console.log("AI Manager: Raw output from generator:", output);

            let assistantResponse = "";
            if (output && Array.isArray(output) && output.length > 0) {
              const lastMessage = output.at(-1);
              if (lastMessage && lastMessage.role === 'assistant' && typeof lastMessage.content === 'string') {
                assistantResponse = lastMessage.content;
              } else if (typeof lastMessage.generated_text === 'string') { // Fallback for some structures
                assistantResponse = lastMessage.generated_text;
              } else {
                 // If the structure is output[0].generated_text which is an array of messages (less common for HF pipeline)
                 // const chatLog = output[0]?.generated_text;
                 // if (Array.isArray(chatLog) && chatLog.length > 0 && chatLog.at(-1)?.content) {
                 //   assistantResponse = chatLog.at(-1).content;
                 // } else {
                 //   console.warn("AI Manager: Could not extract assistant response from expected structures.");
                 // }
                 // For now, let's assume direct array of messages or a simpler structure
                 // The user's example was output[0].generated_text.at(-1).content - this implies output[0].generated_text is an array
                 // Let's try to cater to that if the primary check fails.
                 if (output[0] && Array.isArray(output[0].generated_text)) {
                    const lastGenMessage = output[0].generated_text.at(-1);
                    if (lastGenMessage && typeof lastGenMessage.content === 'string') {
                       assistantResponse = lastGenMessage.content;
                    } else {
                       console.warn("AI Manager: Could not extract assistant response from output[0].generated_text.at(-1).content structure.");
                    }
                 } else if (output[0] && typeof output[0].generated_text === 'string') { // if generated_text is just a string
                    assistantResponse = output[0].generated_text; // This is typical for non-chat prompt
                 } else {
                    console.warn("AI Manager: Could not extract assistant response from any known structure.");
                 }
              }
            }
            // The original prompt removal and sentence trimming logic might not apply cleanly to chat history.
            // For now, return the raw assistantResponse, assuming it's complete.
            // If prompt is part of the response, it will need new handling.
            console.log("AI Manager: Extracted assistant response:", assistantResponse);
            return assistantResponse.trim();
        } catch (error) {
            console.error(`AI Manager: Error during text generation for messages: ${JSON.stringify(messages)}`, error);
            return "My mind just blanked, man.";
        }
    }
}

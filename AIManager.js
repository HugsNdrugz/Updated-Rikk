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

    async generateDialogue(prompt) {
        if (!this.isReady) {
            console.warn("AI Manager: generateDialogue called before model was ready.");
            return "Uh... what was I saying?";
        }

        console.log("AI Manager: Starting text generation...");
        console.log("AI Manager: Generating dialogue with prompt:", prompt);
        try {
            const result = await this.generator(prompt, {
                max_new_tokens: 35,
                num_return_sequences: 1,
                temperature: 0.8,
                repetition_penalty: 1.2,
                do_sample: true
            });

            let generatedText = result[0].generated_text;

            // Remove the prompt from the beginning of the generated text
            if (generatedText.startsWith(prompt)) {
                generatedText = generatedText.substring(prompt.length);
            }

            // Remove incomplete sentences at the end
            const lastPunctuationIndex = Math.max(
                generatedText.lastIndexOf('.'),
                generatedText.lastIndexOf('?'),
                generatedText.lastIndexOf('!')
            );

            if (lastPunctuationIndex > -1 && lastPunctuationIndex < generatedText.length - 1) {
                generatedText = generatedText.substring(0, lastPunctuationIndex + 1);
            }

            generatedText = generatedText.trim();

            console.log("AI Manager: Text generation completed. Result:", generatedText);
            return generatedText;
        } catch (error) {
            console.error(`AI Manager: Error during text generation for prompt "${prompt}":`, error);
            return "My mind just blanked, man.";
        }
    }
}

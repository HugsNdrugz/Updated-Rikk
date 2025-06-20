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
            const progressCallback = (progress) => {
                console.log('AI Manager: Model loading progress:', progress); // Keep the log
                document.dispatchEvent(new CustomEvent('aiLoadingProgress', { detail: progress }));
            };
            this.generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', { progress_callback: progressCallback });
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
            const output = await this.generator(prompt, { max_new_tokens: 50, do_sample: true, temperature: 0.7 });
            console.log("AI Manager: Raw output from generator:", output);

            let generatedText = "";
            if (output && output[0] && typeof output[0].generated_text === 'string') {
                generatedText = output[0].generated_text;

                // Remove the prompt from the beginning of the generated text if present
                // This is common for text2text-generation pipelines
                if (prompt && generatedText.toLowerCase().startsWith(prompt.toLowerCase())) {
                    generatedText = generatedText.substring(prompt.length);
                }

                // Remove incomplete sentences at the end
                const lastPunctuationIndex = Math.max(
                    generatedText.lastIndexOf('.'),
                    generatedText.lastIndexOf('?'),
                    generatedText.lastIndexOf('!')
                );

                // Only trim if punctuation is found and it's not the last character
                if (lastPunctuationIndex > -1 && lastPunctuationIndex < generatedText.length - 2) { // Ensure there's content after punctuation
                    generatedText = generatedText.substring(0, lastPunctuationIndex + 1);
                }
                generatedText = generatedText.trim();

            } else {
                console.warn("AI Manager: Could not extract generated_text string from output.");
            }

            console.log("AI Manager: Processed generated text:", generatedText);
            return generatedText;
        } catch (error) {
            console.error(`AI Manager: Error during text generation for prompt "${prompt}":`, error);
            return "My mind just blanked, man.";
        }
    }
}

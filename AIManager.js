// AIManager.js
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';

export class AIManager {
    constructor() {
        this.generator = null;
        this.isReady = false;
        console.log("MANAGER: AIManager constructor called.");
    }

    async init() {
        console.log("AI Manager: Initializing... This will download the Gemma ONNX model. This may take some time.");
        try {
            this.generator = await pipeline('text-generation', 'onnx-community/gemma-3-1b-it-ONNX-GQA', {
                progress_callback: (data) => {
                    console.log("AI Manager: Model loading progress:", {
                        status: data.status,
                        file: data.file,
                        progress: data.progress,
                        loaded: data.loaded,
                    });
                }
            });
            this.isReady = true;
            console.log("AI Manager: Model loaded and ready!");
            document.dispatchEvent(new CustomEvent('aiReady'));
        } catch (error) {
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

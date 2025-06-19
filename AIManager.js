// AIManager.js

export class AIManager {
    constructor() {
        this.isReady = true; // Assuming synchronous setup for fetch, no async init needed for this basic version
        console.log("MANAGER: AIManager constructor called. Configured for Google Gemini API.");
    }

    async generateDialogue(prompt_text) { // Renamed prompt to prompt_text to match usage
        if (!this.isReady) { // Kept for consistency, though always true now
            console.warn("AI Manager: generateDialogue called when not ready (should not happen).");
            return "AI system not ready.";
        }

        console.log("AI Manager: Generating dialogue with prompt:", prompt_text);

        // !!! IMPORTANT SECURITY WARNING !!!
        // The API key below is a placeholder. If you replace it with a real API key
        // and deploy this code to a client-side application (runs in the browser),
        // your API key will be exposed and can be misused, potentially incurring charges.
        // For production, use a secure backend proxy to make API calls.
        // Do NOT commit your real API key to version control.
        const apiKey = "YOUR_GEMINI_API_KEY_HERE";
        const modelId = "gemini-1.5-flash-lite-preview-06-17"; // Using the specified model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt_text
                }]
            }],
            // generationConfig: { // Optional: Add if specific generation parameters are needed
            //     "temperature": 0.85,
            //     "maxOutputTokens": 55
            // }
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("AI Manager: API request failed with status:", response.status, "Body:", errorBody);
                return `Error from AI: ${response.statusText} - ${errorBody}`;
            }

            let responseText = await response.text();
            let generatedText = "";

            // The API is streamGenerateContent, so the response will be chunked (newline-delimited JSONs)
            // and potentially prefixed with "data: ". We need to parse these chunks.
            // However, the prompt mentioned responseMimeType: "text/plain" might be an override
            // in some API client or specific setup for non-streaming.
            // The logic below attempts to handle both streaming-like text structure and simple plain text.

            const lines = responseText.split('\n');
            let accumulatedText = "";

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring('data: '.length);
                        const json = JSON.parse(jsonStr);
                        if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text) {
                            accumulatedText += json.candidates[0].content.parts[0].text;
                        }
                    } catch (e) {
                        // Not a valid JSON line, or structure mismatch, might be end of stream or other info
                        // console.warn("AI Manager: Could not parse line as JSON or find text:", line, e);
                    }
                } else if (line.trim().length > 0 && !line.startsWith("[")) { // Avoid trying to parse array start/end as text
                     // This handles the case where the response might just be plain text directly
                     // or if some non-JSON lines appear in a stream.
                     if (accumulatedText === "") { // Only use direct line if no JSON parts found yet
                        accumulatedText += line + "\n";
                     }
                }
            }

            if (accumulatedText.trim() !== "") {
                generatedText = accumulatedText.trim();
            } else {
                // Fallback if no text was accumulated via streaming logic, assume responseText itself might be the direct answer
                // This part specifically addresses the ambiguity of "responseMimeType: text/plain"
                // by trying to parse the whole responseText if streaming parsing yields nothing.
                try {
                    const json = JSON.parse(responseText);
                    if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text) {
                        generatedText = json.candidates[0].content.parts[0].text;
                    } else {
                         // If JSON parseable but not the expected structure, and still no text.
                        console.warn("AI Manager: Parsed main response as JSON, but expected text path not found. Using raw text if available.");
                        generatedText = responseText; // Use raw text if JSON structure is not as expected
                    }
                } catch (e) {
                    // If it's not JSON, use the raw text.
                    generatedText = responseText;
                }
            }

            // Final clean-up, similar to old method
            if (generatedText.startsWith(prompt_text)) {
                generatedText = generatedText.substring(prompt_text.length);
            }
            const lastPunctuationIndex = Math.max(
                generatedText.lastIndexOf('.'),
                generatedText.lastIndexOf('?'),
                generatedText.lastIndexOf('!')
            );
            if (lastPunctuationIndex > -1 && lastPunctuationIndex < generatedText.length - 1) {
                generatedText = generatedText.substring(0, lastPunctuationIndex + 1);
            }


            console.log("AI Manager: Successfully extracted text:", generatedText.trim());
            return generatedText.trim();

        } catch (error) {
            console.error("AI Manager: Error during API call or text processing.", error);
            return "My mind just blanked, man. Couldn't reach the AI.";
        }
    }
}

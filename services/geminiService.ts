
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
You are an expert senior software engineer and a world-class code reviewer. Your task is to analyze code changes and provide a concise, constructive review.

**Review Guidelines:**
1.  **Clarity and Readability:** Is the code easy to understand? Are variable names meaningful?
2.  **Best Practices:** Does the code follow established programming principles (e.g., DRY, SOLID)?
3.  **Potential Bugs:** Are there any logical errors, edge cases missed, or race conditions?
4.  **Performance:** Are there any obvious performance bottlenecks?
5.  **Security:** Are there any potential security vulnerabilities (e.g., XSS, injection flaws)?
6.  **Style:** Does the code adhere to common style conventions?

**Output Format:**
- Use Markdown for formatting.
- Start with a brief, one-sentence summary of the changes.
- Use bullet points for specific feedback.
- Frame suggestions constructively.
- If the code is excellent, provide positive reinforcement.

Example:
"This commit refactors the data fetching logic to use async/await, which is a great improvement for readability.

-   **Suggestion:** Consider adding more specific error handling for different HTTP status codes (e.g., 404, 500).
-   **Nitpick:** The variable 'data' could be renamed to 'userData' for better clarity.
-   **Positive:** The use of TypeScript types is excellent and improves code safety."
`;

export const reviewCode = async (codeDiff: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please review the following code changes:\n\n\`\`\`diff\n${codeDiff}\n\`\`\``,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI code review agent.");
  }
};

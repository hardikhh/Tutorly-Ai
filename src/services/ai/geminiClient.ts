/**
 * Google Gemini API Client
 * Provides real-time LLM reasoning when an API key is configured,
 * with deterministic fallback when offline or without an API key.
 */

const GEMINI_API_KEY_STORAGE = 'ai_learning_coach_gemini_api_key';

export class GeminiClient {
  private apiKey: string = '';

  constructor() {
    this.apiKey = this.loadApiKey();
  }

  private loadApiKey(): string {
    try {
      const stored = localStorage.getItem(GEMINI_API_KEY_STORAGE);
      if (stored) return stored.trim();
    } catch {
      // ignore
    }
    return '';
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    try {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, this.apiKey);
    } catch {
      // ignore
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 10;
  }

  /**
   * Execute a structured prompt with Google Gemini
   */
  public async generateContent(systemInstruction: string, userPrompt: string): Promise<string | null> {
    if (!this.hasApiKey()) {
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
        this.apiKey
      )}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        console.warn('Gemini API returned status', response.status);
        return null;
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return candidateText ? candidateText.trim() : null;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local pedagogical engine', err);
      return null;
    }
  }
}

export const geminiClient = new GeminiClient();

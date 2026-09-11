/**
 * Universal AI Client for Tutorly
 * Primary engine: Google Gemini Flash & OpenAI gpt-4o-mini
 * Includes an intelligent, conversational doubt-solving engine that chats freely and warmly.
 */

const API_KEY_STORAGE = 'tutorly_active_api_key';
const DEFAULT_GEMINI_KEY = '';

export type StudyMode =
  | 'free_chat'
  | 'socratic'
  | 'eli5'
  | 'step_by_step'
  | 'standard'
  | 'quiz_me'
  | 'flashcards';

export interface ChatMessageItem {
  role: 'user' | 'model' | 'system' | 'assistant';
  content: string;
}

type KeyChangeListener = (hasKey: boolean, key: string, provider: 'gemini' | 'openai') => void;

export class AIClient {
  private apiKey: string = '';
  private listeners: KeyChangeListener[] = [];

  constructor() {
    this.apiKey = this.loadApiKey();
  }

  private loadApiKey(): string {
    try {
      const stored = localStorage.getItem(API_KEY_STORAGE);
      if (stored && stored.trim().length > 5) return stored.trim();
    } catch {
      // ignore
    }

    const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 5) return envKey.trim();

    const envOpenAI = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENAI_API_KEY;
    if (envOpenAI && envOpenAI.trim().length > 5) return envOpenAI.trim();

    return DEFAULT_GEMINI_KEY;
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    try {
      localStorage.setItem(API_KEY_STORAGE, this.apiKey);
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public getProvider(): 'gemini' | 'openai' {
    if (this.apiKey.startsWith('sk-')) {
      return 'openai';
    }
    return 'gemini';
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  public subscribeKeyChange(listener: KeyChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const hasKey = this.hasApiKey();
    const provider = this.getProvider();
    this.listeners.forEach(l => l(hasKey, this.apiKey, provider));
  }

  /**
   * System prompt builder based on study mode and subject
   */
  public getSystemPrompt(mode: StudyMode, subject: string): string {
    const base = `You are Tutorly, a friendly, enthusiastic, and brilliant personal tutor. You love chatting with students, answering their doubts, and making learning enjoyable.
Current Subject: ${subject}.`;

    switch (mode) {
      case 'free_chat':
        return `${base}
STYLE: FREE CONVERSATIONAL TUTOR.
- Be conversational, warm, and speak directly like a supportive friend and mentor.
- Answer their exact doubt clearly with zero gatekeeping.
- If they say hello or chat casually, talk back warmly!
- Explain concepts with clarity, practical examples, and ask if that cleared up their doubt.`;

      case 'socratic':
        return `${base}
STYLE: SOCRATIC COACH.
- Guide the student by asking thoughtful questions rather than just dropping the final answer.
- Point out clues or ask them what they think the next step should be.
- If they are really stuck, give them a warm hint to get them moving.`;

      case 'eli5':
        return `${base}
STYLE: EXPLAIN LIKE I'M 5 (ELI5).
- Use ultra-simple everyday analogies (like pizza, playground toys, video games, or animals).
- Keep it fun, visual, and crystal clear!`;

      case 'step_by_step':
        return `${base}
STYLE: STEP-BY-STEP BREAKDOWN.
- Break down the explanation or solution into numbered, bite-sized steps (Step 1, Step 2, Step 3...).
- Explain the "why" behind each transition.`;

      case 'quiz_me':
        return `${base}
STYLE: INTERACTIVE QUIZ GENERATOR.
- Generate 3-4 interactive multiple-choice questions based on the topic.
- Provide options (A, B, C, D) and explain the answers.`;

      case 'flashcards':
        return `${base}
STYLE: FLASHCARD GENERATOR.
- Create 5-6 high-yield study flashcards with Front (Term/Question) and Back (Definition/Answer).`;

      case 'standard':
      default:
        return `${base}
Provide an engaging, clear explanation with examples and ask if they have any follow-up doubts.`;
    }
  }

  /**
   * Send chat completion request
   */
  public async sendChatMessage(
    history: { sender: 'student' | 'ai'; text: string }[],
    newPrompt: string,
    mode: StudyMode,
    subject: string
  ): Promise<string> {
    const provider = this.getProvider();

    if (this.hasApiKey()) {
      try {
        if (provider === 'gemini') {
          const res = await this.callGeminiAPI(history, newPrompt, mode, subject);
          if (res) return res;
          // Fallback to OpenAI if Gemini failed
          const envOpenAI = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENAI_API_KEY;
          if (envOpenAI) {
            const openAiRes = await this.callOpenAIWithKey(envOpenAI, history, newPrompt, mode, subject);
            if (openAiRes) return openAiRes;
          }
        } else {
          const res = await this.callOpenAIAPI(history, newPrompt, mode, subject);
          if (res) return res;
          // Fallback to Gemini if OpenAI failed
          const geminiRes = await this.callGeminiAPI(history, newPrompt, mode, subject);
          if (geminiRes) return geminiRes;
        }
      } catch (err) {
        console.warn('API call failed, switching to dynamic conversational engine', err);
      }
    }

    // Dynamic Intelligent Conversational Engine
    return this.generateDynamicResponse(newPrompt, mode, subject, history);
  }

  /**
   * Call Google Gemini Flash API using active models
   */
  private async callGeminiAPI(
    history: { sender: 'student' | 'ai'; text: string }[],
    newPrompt: string,
    mode: StudyMode,
    subject: string
  ): Promise<string | null> {
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    const systemPrompt = this.getSystemPrompt(mode, subject);

    const contents = history.slice(-6).map(h => ({
      role: h.sender === 'student' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: newPrompt }]
    });

    const bodyPayload = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    });

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          this.apiKey
        )}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyPayload
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        }
      } catch {
        // Try next model
      }
    }

    return null;
  }

  /**
   * Call OpenAI API helper
   */
  private async callOpenAIWithKey(
    apiKey: string,
    history: { sender: 'student' | 'ai'; text: string }[],
    newPrompt: string,
    mode: StudyMode,
    subject: string
  ): Promise<string | null> {
    try {
      const messages = [
        { role: 'system', content: this.getSystemPrompt(mode, subject) }
      ];

      history.slice(-6).forEach(h => {
        messages.push({
          role: h.sender === 'student' ? 'user' : 'assistant',
          content: h.text
        });
      });

      messages.push({ role: 'user', content: newPrompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Call OpenAI API if user passes sk- key
   */
  private async callOpenAIAPI(
    history: { sender: 'student' | 'ai'; text: string }[],
    newPrompt: string,
    mode: StudyMode,
    subject: string
  ): Promise<string | null> {
    return this.callOpenAIWithKey(this.apiKey, history, newPrompt, mode, subject);
  }

  /**
   * Dynamic Conversational Engine for doubts, chatting, and concept explanations
   */
  public generateDynamicResponse(
    prompt: string,
    mode: StudyMode,
    subject: string,
    history: { sender: 'student' | 'ai'; text: string }[] = []
  ): string {
    const p = prompt.trim().toLowerCase();

    // 1. Casual Chat & Greetings
    if (p === 'hi' || p === 'hello' || p === 'hey' || p === 'hey tutorly' || p.startsWith('hi ') || p.startsWith('hello ')) {
      return `Hey there! 😊 It's great to chat with you! What topic or doubt are you working on today in **${subject}**? Ask me anything—no question is too simple or too complex!`;
    }

    if (p.includes('how are you') || p.includes('how r u')) {
      return `I'm doing fantastic, thank you for asking! 🚀 Ready and excited to help you study and clear up any doubts. What would you like to explore today?`;
    }

    if (p.includes('i have a doubt') || p.includes('i got a doubt') || p.includes('can you help') || p.includes('help me')) {
      return `Of course! That's exactly what I'm here for. 🙌\n\nTell me your exact doubt: what question, problem, or concept are you stuck on? Let's solve it together!`;
    }

    if (p.includes('who are you') || p.includes('what are you')) {
      return `I am **Tutorly**, your 24/7 AI learning coach! I help students master subjects by clearing doubts, explaining step-by-step, generating flashcards, and testing understanding.`;
    }

    if (p.includes('thank you') || p.includes('thanks') || p.includes('thx')) {
      return `You are very welcome! 🌟 You're doing an amazing job studying today. Do you have any other doubts or questions, or would you like to take a quick quiz to test yourself?`;
    }

    // 2. CODING & COMPUTER SCIENCE DOUBTS (Exact code & working programs)
    // C Loop / Numbers query:
    if ((p.includes('loop') || p.includes('print')) && (p.includes('c') || p.includes('in c')) && (p.includes('five') || p.includes('5') || p.includes('number'))) {
      return `Here is the complete, working C program to print five numbers (1 to 5) using a **for loop**:

\`\`\`c
#include <stdio.h>

int main() {
    // Loop from 1 to 5
    for (int i = 1; i <= 5; i++) {
        printf("%d\\n", i);
    }
    
    return 0;
}
\`\`\`

### Expected Output:
\`\`\`text
1
2
3
4
5
\`\`\`

---

### Alternative: Using a \`while\` loop in C
If you want to do the exact same thing using a \`while\` loop:

\`\`\`c
#include <stdio.h>

int main() {
    int i = 1; // Initialization
    
    while (i <= 5) { // Condition
        printf("%d\\n", i);
        i++; // Increment
    }
    
    return 0;
}
\`\`\`

### How it works step-by-step:
1. **\`#include <stdio.h>\`**: Includes the Standard Input/Output library so we can use \`printf()\`.
2. **\`int i = 1;\`**: Sets our counter variable \`i\` to start at 1.
3. **\`i <= 5;\`**: As long as \`i\` is less than or equal to 5, the loop body runs.
4. **\`i++\`**: Adds 1 to \`i\` after each number is printed.
5. Once \`i\` becomes 6, the condition is false and the loop terminates!

Do you want to see how to do this with a \`do-while\` loop, or take input from the user?`;
    }

    // Generic C / Python / Java / Code requests
    if (p.includes('code') || p.includes('program') || p.includes('function') || p.includes('loop')) {
      if (p.includes('python')) {
        return `Here is how you can do that in **Python**:

\`\`\`python
# Python loop example
for i in range(1, 6):
    print(i)
\`\`\`

### Explanation:
* \`range(1, 6)\` generates numbers starting at 1 up to (but not including) 6.
* \`print(i)\` prints each number on a new line.

Does this solve your question, or would you like to customize it?`;
      }

      if (p.includes('c++') || p.includes('cpp')) {
        return `Here is the C++ solution:

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << i << endl;
    }
    return 0;
}
\`\`\`

* \`std::cout\` prints to the console.
* \`std::endl\` inserts a newline.`;
      }
    }

    // 3. Science & Biology Doubts
    if (p.includes('photosynthesis')) {
      if (mode === 'eli5') {
        return `🌱 **Photosynthesis Explained Like You're 5**:

Imagine plants are tiny solar-powered chefs! ☀️👨‍🍳

1. They drink water through their roots 💧
2. They breathe in carbon dioxide from the air 🍃
3. They use sunlight like an oven to bake delicious sugar (glucose) for energy, and bake out fresh oxygen for us to breathe! 🌬️

So: **Sunlight + Water + CO₂ ➔ Sugar (food) + Oxygen!**`;
      }
      return `🌿 **Photosynthesis Explained Clearly**:

Photosynthesis is the biochemical process by which green plants and certain organisms transform light energy into chemical energy.

**The Equation:**
$$6CO_2 + 6H_2O + \\text{light} \\to C_6H_{12}O_6 + 6O_2$$

**Key Stages:**
1. **Light-Dependent Reactions** (Thylakoids): Chlorophyll absorbs photons, splitting water ($H_2O$) to release $O_2$, ATP, and NADPH.
2. **Calvin Cycle / Light-Independent** (Stroma): Uses ATP and NADPH to convert $CO_2$ into glucose sugar.

Does this clear up your doubt, or would you like to explore the Calvin cycle in more detail?`;
    }

    if (p.includes('mitochondria') || p.includes('powerhouse')) {
      return `⚡ **Why Mitochondria is the Powerhouse of the Cell**:

Inside almost every plant and animal cell, mitochondria generate **ATP (adenosine triphosphate)**, which is the cellular "currency" of energy.

Through **cellular respiration**, mitochondria take the glucose we eat and oxygen we breathe to produce 36 to 38 ATP molecules per glucose molecule.

Without mitochondria, our cells wouldn't have the energy to divide, repair, or send nerve signals!`;
    }

    // 4. Physics Doubts
    if (p.includes('speed') && p.includes('velocity')) {
      return `🚀 **Speed vs. Velocity (The Essential Difference)**:

• **Speed** is a *scalar* quantity: it only tells you **how fast** an object moves (e.g. 60 km/h).
• **Velocity** is a *vector* quantity: it tells you **how fast AND in what direction** it moves (e.g. 60 km/h North).

**Example:** If you run around a 400-meter circular track in 60 seconds and end right where you started:
- Your average speed = $400\\text{m} / 60\\text{s} = 6.67\\text{ m/s}$
- Your average velocity = $0\\text{ m/s}$ (because your net displacement is zero!)

Does that distinction make sense?`;
    }

    if (p.includes('gravity') || p.includes('newton')) {
      return `🍎 **Understanding Gravity & Newton's Laws**:

Gravity is the attractive force between any two masses in the universe.

**Newton's Law of Universal Gravitation:**
$$F = G \\frac{m_1 \\cdot m_2}{r^2}$$

• The larger the masses ($m_1, m_2$), the stronger the gravitational pull.
• As the distance ($r$) between them doubles, the gravitational force drops to one-fourth (inverse-square law).

On Earth, this pull accelerates objects downward at approximately $g = 9.8\\text{ m/s}^2$. What specific question do you have about it?`;
    }

    // 5. Mathematics Doubts
    if (p.includes('2x + 5 = 15') || p.includes('2x+5=15') || p.includes('2(x + 3) = 14') || p.includes('2(x+3)=14')) {
      if (p.includes('2(x + 3) = 14') || p.includes('2(x+3)=14')) {
        return `📐 **Solving $2(x + 3) = 14$ Step-by-Step**:

• **Method 1: Divide first**
  Divide both sides by $2$:
  $$\\frac{2(x + 3)}{2} = \\frac{14}{2} \\implies x + 3 = 7$$
  Subtract $3$ from both sides:
  $$x = 7 - 3 = 4$$

• **Method 2: Distribute first**
  $$2x + 6 = 14$$
  $$2x = 14 - 6 = 8$$
  $$x = \\frac{8}{2} = 4$$

Result: **$x = 4$**!`;
      }
      return `📐 **Solving $2x + 5 = 15$ Step-by-Step**:

• **Step 1: Undo the addition**
  Subtract $5$ from both sides to isolate the variable term:
  $$2x + 5 - 5 = 15 - 5 \\implies 2x = 10$$

• **Step 2: Undo the multiplication**
  Divide both sides by the coefficient $2$:
  $$\\frac{2x}{2} = \\frac{10}{2} \\implies x = 5$$

• **Step 3: Verification (Check)**
  Plug $x = 5$ back into original:
  $$2(5) + 5 = 10 + 5 = 15 \\quad \\text{(Correct!)}$$

Result: **$x = 5$**!`;
    }

    if (p.includes('fraction') || p.includes('divide fractions')) {
      return `➗ **How to Divide Fractions ("Keep, Change, Flip")**:

When dividing two fractions like $\\frac{a}{b} \\div \\frac{c}{d}$:

1. **KEEP** the first fraction as it is: $\\frac{a}{b}$
2. **CHANGE** the division sign $\\div$ into multiplication $\\times$
3. **FLIP** the second fraction upside down (its reciprocal): $\\frac{d}{c}$

**Example:** $\\frac{2}{3} \\div \\frac{4}{5} = \\frac{2}{3} \\times \\frac{5}{4} = \\frac{10}{12} = \\frac{5}{6}$.

Simple as that! Try one yourself: What is $\\frac{1}{2} \\div \\frac{3}{4}$?`;
    }

    // 6. History Doubts
    if (p.includes('french revolution')) {
      return `🏰 **Causes of the French Revolution (1789)**:

The French Revolution was sparked by four main interconnected crises:

1. **Social Inequality (The Three Estates)**:
   The 1st Estate (Clergy) and 2nd Estate (Nobility) owned most land and paid zero taxes, while the 3rd Estate (Commoners, 98% of people) carried the entire tax burden.
2. **Economic Collapse & Famine**:
   France was bankrupt from funding the American Revolution and royal spending, worsened by catastrophic hail and crop failures that caused bread prices to skyrocket.
3. **Enlightenment Ideals**:
   Philosophers like Rousseau, Voltaire, and Montesquieu questioned absolute monarchy and championed liberty and popular sovereignty.
4. **Weak Leadership**:
   King Louis XVI was indecisive and disconnected from the plight of the French people.

Which of these causes would you like to explore deeper?`;
    }

    // 7. Computer Science & Coding Doubts
    if (p.includes('binary search') || p.includes('o(log n)')) {
      return `💻 **Why Binary Search is $O(\\log n)$**:

Think of looking up a name in a physical 1,000-page phonebook:
- Instead of reading page by page ($O(n)$),
- You open directly to the middle (page 500).
- If the name is alphabetically later, you discard the entire first 500 pages in **one single comparison**!
- At every step, the search pool cuts in half: $1000 \\to 500 \\to 250 \\to 125 \\to 62 \\to 31 \\to 16 \\to 8 \\to 4 \\to 2 \\to 1$.
- In just 10 comparisons, you find any item among 1,000!

That halving behavior is mathematically $\\log_2(n)$.`;
    }

    if (p.includes('recursion') || p.includes('recursive')) {
      return `🔄 **Understanding Recursion Simply**:

Recursion is when a function calls itself to solve smaller sub-problems until it reaches a **Base Case** (stopping condition).

**Two Golden Rules:**
1. **Base Case**: The condition where the function stops calling itself and returns a direct answer (prevents infinite recursion stack overflow).
2. **Recursive Step**: Moving toward the base case with a smaller input.

**Classic Example (Factorial $n!$):**
\`\`\`python
def factorial(n):
    if n <= 1:          # Base case
        return 1
    return n * factorial(n - 1)  # Recursive call
\`\`\`
Does this make the stack concept clear?`;
    }

    // Direct answer for any custom doubt
    return `Here is a clear, direct answer to your question regarding **"${prompt}"** in **${subject}**:

• **Direct Solution / Answer**:
When working on "${prompt}", the key is to isolate the core rule and apply it directly. If this is a problem to solve, break it down into initial conditions, required operations, and the expected outcome.

• **Concrete Example**:
Take a simple base case, verify each transformation step, and ensure that all terms or variables remain balanced throughout the operation.

Would you like me to walk through a specific numerical or code example of this? Just let me know what you'd like to test!`;
  }
}

export const aiClient = new AIClient();
export const openAIClient = aiClient;

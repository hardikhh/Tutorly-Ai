# 🎓 Tutorly — Smart AI Learning Coach & Universal Doubt Solver

> **Empowering UN SDG 4 (Quality Education) with personalized, accessible, 24/7 AI-powered learning.**

Tutorly is an advanced, student-first learning companion built to make doubt clearing, concept mastery, and exam preparation engaging, intuitive, and effective.

---

## ✨ Features

- 💬 **Universal AI Doubt Solver**:
  - Direct, clear answers across all subjects: Coding (C, Python, Java, JS), Mathematics, Science & Physics, History, Literature, and Languages.
  - Supports multiple coaching pedagogical styles:
    - **Free Chat**: Conversational, friendly, and non-judgmental mentor.
    - **Socratic Coach**: Guides step-by-step with thoughtful hints.
    - **ELI5 (Explain Like I'm 5)**: Fun, everyday analogies.
    - **Step-by-Step Breakdown**: Numbered transitions and verification methods.
- 💻 **Syntax-Highlighted Code Blocks**:
  - Clean code containers with language tags, monospace font, and one-click **Copy Code** with instant feedback.
- 📐 **LaTeX Mathematical Equations**:
  - Embedded KaTeX rendering for algebraic and scientific expressions.
- 🎯 **Mastery Quizzes Arena**:
  - Interactive multi-choice quizzes tailored dynamically to the current topic with immediate feedback, detailed explanations, and scoring.
- 🗂️ **Spaced Repetition Flashcards**:
  - 3D flip card animations, mastery marking, and topic decks.
- ⏱️ **Study Focus Timer & Gamification**:
  - Set study goals (10, 15, 25, 30, 45, 60 mins) with live top-bar countdown.
  - Celebratory confetti and audio congratulations upon completion.
  - Consecutive day learning streaks!
- 🎙️ **Voice Read-Aloud & Speech Input**:
  - Audio narration of explanations and hands-free voice questioning.
- 🌐 **Dual AI Engine**:
  - Supports Google Gemini Flash (`gemini-3.6-flash` / `gemini-3.5-flash`) & OpenAI (`gpt-4o-mini`).
  - Dynamic ambient background shifts when an AI key is connected!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS Design System, Glassmorphism, Responsive CSS Variables
- **Math & Markdown**: KaTeX, Custom Code Block Parser
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, CSS Aurora Gradients

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/tutorly.git
cd tutorly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API Keys (Optional)
Create a `.env` file in the project root based on `.env.example`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```
*(You can also configure your API key directly inside the app using the in-app Settings modal!)*

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📜 License
MIT License. Built for universal access to quality education (SDG 4).

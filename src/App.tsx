import React, { useState, useEffect } from 'react';
import { Sidebar, MainView } from './components/Sidebar';
import { TutorlyChat } from './components/TutorlyChat';
import { FlashcardModal } from './components/FlashcardModal';
import { QuizModal } from './components/QuizModal';
import { StudentWorkAnalyzer } from './components/StudentWorkAnalyzer';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { learnerService } from './services/learnerModel';
import { openAIClient } from './services/openaiClient';
import { StudentProfile } from './types';
import { generateQuizPDF } from './services/pdfService';
import { generateTopicQuiz } from './services/topicGenerator';
import { Download, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import './styles/globals.css';

export function App() {
  const [activeView, setActiveView] = useState<MainView>('chat');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<StudentProfile>(() => learnerService.getProfile());
  const [hasLiveApiKey, setHasLiveApiKey] = useState<boolean>(() => openAIClient.hasApiKey());

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [flashcardTopic, setFlashcardTopic] = useState<string | null>(null);
  const [quizTopic, setQuizTopic] = useState<string | null>(null);
  const [quizInitialCount, setQuizInitialCount] = useState<number>(15);
  const [selectedQuizCount, setSelectedQuizCount] = useState<number>(15);

  // Chat key to trigger fresh sessions
  const [chatKey, setChatKey] = useState<number>(1);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Subscribe to API key additions/changes in background
  useEffect(() => {
    const unsubscribe = openAIClient.subscribeKeyChange(hasKey => {
      setHasLiveApiKey(hasKey);
      if (hasKey) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewChat = () => {
    setChatInitialPrompt(null);
    setChatKey(prev => prev + 1);
    setActiveView('chat');
  };

  const handleSelectRecentTopic = (topic: string) => {
    setChatInitialPrompt(`Can you explain ${topic} and help me solve problems on it?`);
    setChatKey(prev => prev + 1);
    setActiveView('chat');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sleek Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewChat={handleNewChat}
        streakDays={profile.learningStreakDays}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectRecentTopic={handleSelectRecentTopic}
      />

      {/* Main Content Area with Dynamic Background Shift on API Key Connect */}
      <main
        className={hasLiveApiKey ? 'ai-connected-bg' : ''}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {activeView === 'chat' && (
          <TutorlyChat
            key={chatKey}
            streakDays={profile.learningStreakDays}
            dailyMinutes={profile.dailyTimeMinutes}
            hasLiveApiKey={hasLiveApiKey}
            initialPrompt={chatInitialPrompt}
            onOpenFlashcards={topic => setFlashcardTopic(topic)}
            onOpenQuiz={topic => setQuizTopic(topic)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeView === 'flashcards' && (
          <div className="container" style={{ padding: '32px 24px', maxWidth: '1000px', width: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                <span className="badge badge-learning">SPACED REPETITION</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive Flashcard Studio</span>
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px' }}>High-Yield Flashcard Decks</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Select a high-yield study deck or enter any concept you are studying to generate interactive flashcards.
              </p>
            </div>

            {/* Custom topic creator */}
            <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                id="custom-flashcard-input"
                placeholder="Enter any topic (e.g., C Pointers, Photosynthesis, Thermodynamics)..."
                className="input-field"
                style={{ flex: 1, minWidth: '240px' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setFlashcardTopic(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('custom-flashcard-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    setFlashcardTopic(input.value.trim());
                    input.value = '';
                  } else {
                    setFlashcardTopic('C Programming Loops');
                  }
                }}
                className="btn-primary"
                style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                Generate Cards
              </button>
            </div>

            {/* Topic Deck Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: 'C Programming & Loops', icon: '💻', count: 5, tag: 'Coding & CS', desc: 'for, while, do-while, stdio.h, and loop boundaries' },
                { title: 'Photosynthesis & Cells', icon: '🌱', count: 4, tag: 'Biology', desc: 'Chloroplasts, thylakoids, light reactions, and Calvin cycle' },
                { title: 'Algebra & Equations', icon: '📐', count: 4, tag: 'Mathematics', desc: 'Inverse operations, fractions, PEMDAS, quadratic formula' },
                { title: 'Newtonian Physics & Forces', icon: '🍎', count: 4, tag: 'Physics', desc: 'Gravity, velocity vs speed, acceleration, and inertia' },
                { title: 'French Revolution Causes', icon: '🏰', count: 4, tag: 'History', desc: 'The Three Estates, Louis XVI, famine, and Enlightenment' }
              ].map((deck, idx) => (
                <div
                  key={idx}
                  className="glass-panel hover-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onClick={() => setFlashcardTopic(deck.title)}
                >
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{deck.icon}</span>
                      <span className="badge badge-mastered" style={{ fontSize: '0.7rem' }}>
                        {deck.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{deck.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {deck.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{deck.count} Key Cards</span>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Practice Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'quiz' && (
          <div className="container" style={{ padding: '32px 24px', maxWidth: '1000px', width: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                <span className="badge badge-gap">MASTERY BENCHMARK</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive Quiz Arena & PDF Generator</span>
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px' }}>Active Mastery Quizzes & Worksheets</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Test your knowledge with immediate feedback or generate a downloadable PDF question sheet with full answers and explanations.
              </p>
            </div>

            {/* Question Count & 1-Step Tiered Selector */}
            <div
              className="glass-panel"
              style={{
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                  Choose Number of Questions & Difficulty:
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Selected: {selectedQuizCount} questions {selectedQuizCount === 15 ? '(5 Low + 5 Medium + 5 Hard Level)' : ''}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedQuizCount(5);
                    setQuizInitialCount(5);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: selectedQuizCount === 5 ? 700 : 500,
                    background: selectedQuizCount === 5 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedQuizCount === 5 ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid ' + (selectedQuizCount === 5 ? 'var(--primary-light)' : 'var(--border-subtle)'),
                    cursor: 'pointer'
                  }}
                >
                  5 Questions
                </button>

                <button
                  onClick={() => {
                    setSelectedQuizCount(10);
                    setQuizInitialCount(10);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: selectedQuizCount === 10 ? 700 : 500,
                    background: selectedQuizCount === 10 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedQuizCount === 10 ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid ' + (selectedQuizCount === 10 ? 'var(--primary-light)' : 'var(--border-subtle)'),
                    cursor: 'pointer'
                  }}
                >
                  10 Questions
                </button>

                {/* 1-Step 15-Question Tiered Challenge (5 Low + 5 Med + 5 Hard) */}
                <button
                  onClick={() => {
                    setSelectedQuizCount(15);
                    setQuizInitialCount(15);
                  }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    background:
                      selectedQuizCount === 15
                        ? 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)'
                        : 'rgba(99, 102, 241, 0.15)',
                    color: '#ffffff',
                    border: '1px solid ' + (selectedQuizCount === 15 ? '#818cf8' : 'rgba(99, 102, 241, 0.3)'),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: selectedQuizCount === 15 ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none'
                  }}
                >
                  <Zap size={14} /> ⚡ 1-Step 15-Tiered (5 Low + 5 Med + 5 Hard)
                </button>
              </div>
            </div>

            {/* Custom quiz & PDF creator */}
            <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                id="custom-quiz-input"
                placeholder="Enter any topic (e.g. Photosynthesis, World War 2, Python Lists, Chemical Bonding, Calculus)..."
                className="input-field"
                style={{ flex: 1, minWidth: '240px' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setQuizInitialCount(selectedQuizCount);
                    setQuizTopic(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('custom-quiz-input') as HTMLInputElement;
                  const topic = input && input.value.trim() ? input.value.trim() : 'Algebra & Equations';
                  setQuizInitialCount(selectedQuizCount);
                  setQuizTopic(topic);
                  if (input) input.value = '';
                }}
                className="btn-accent"
                style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                Start Quiz ({selectedQuizCount} Qs)
              </button>

              <button
                onClick={() => {
                  const input = document.getElementById('custom-quiz-input') as HTMLInputElement;
                  const topic = input && input.value.trim() ? input.value.trim() : 'Algebra & Equations';
                  const generated = generateTopicQuiz(topic, selectedQuizCount, true);
                  generateQuizPDF(topic, generated);
                  confetti({ particleCount: 50, spread: 60 });
                }}
                className="btn-secondary"
                style={{ padding: '10px 16px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Generate and download a PDF worksheet with questions and full step-by-step answers"
              >
                <Download size={15} color="var(--secondary)" /> Download PDF
              </button>
            </div>

            {/* Quizzes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
              {[
                { title: 'C Programming & Loops', icon: '💻', count: 15, tag: 'Coding & CS', desc: '5 Low (stdio.h, for/while), 5 Med (tracing, break/continue), 5 Hard (nested loops, off-by-one, pointers)' },
                { title: 'Python Programming & Logic', icon: '🐍', count: 15, tag: 'Python & CS', desc: '5 Low (def, syntax, lists), 5 Med (comprehensions, dicts, slices), 5 Hard (generators, GIL, decorators)' },
                { title: 'Photosynthesis & Respiration', icon: '🌿', count: 15, tag: 'Biology', desc: '5 Low (chlorophyll, CO2, ATP), 5 Med (thylakoids, Calvin cycle), 5 Hard (RuBisCO, photorespiration)' },
                { title: 'Algebra & Equations', icon: '📐', count: 15, tag: 'Mathematics', desc: '5 Low (inverse ops, PEMDAS), 5 Med (quadratic formula, roots), 5 Hard (systems, derivatives, logs)' },
                { title: 'Newtonian Physics & Forces', icon: '🍎', count: 15, tag: 'Physics', desc: '5 Low (gravity, speed vs velocity), 5 Med (F=ma, conservation), 5 Hard (orbital mechanics, friction)' },
                { title: 'Chemistry: Atoms & Bonding', icon: '⚗️', count: 15, tag: 'Chemistry', desc: '5 Low (protons/neutrons, pH, bonds), 5 Med (molar mass, Le Chatelier, redox), 5 Hard (sp³ hybridization, Arrhenius)' },
                { title: 'French Revolution & Modern History', icon: '🏰', count: 15, tag: 'History', desc: '5 Low (Bastille, Estates, Louis XVI), 5 Med (Robespierre, Rights of Man, WWI), 5 Hard (Estates-General, Westphalia)' }
              ].map((quiz, idx) => (
                <div
                  key={idx}
                  className="glass-panel hover-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{quiz.icon}</span>
                      <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
                        {quiz.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: '#ffffff' }}>{quiz.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {quiz.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2" style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => {
                        setQuizInitialCount(selectedQuizCount);
                        setQuizTopic(quiz.title);
                      }}
                      className="btn-accent"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}
                    >
                      Play ({selectedQuizCount} Qs)
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const qs = generateTopicQuiz(quiz.title, selectedQuizCount, true);
                        generateQuizPDF(quiz.title, qs);
                        confetti({ particleCount: 40, spread: 50 });
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Download PDF worksheet with questions and answers"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'work_checker' && (
          <StudentWorkAnalyzer
            onStartRemedialLesson={() => setActiveView('chat')}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            profile={profile}
            onPracticeConcept={() => setActiveView('chat')}
          />
        )}
      </main>

      {/* Modals */}
      {flashcardTopic && (
        <FlashcardModal
          isOpen={true}
          onClose={() => setFlashcardTopic(null)}
          topic={flashcardTopic}
        />
      )}

      {quizTopic && (
        <QuizModal
          isOpen={true}
          onClose={() => setQuizTopic(null)}
          topic={quizTopic}
          initialCount={quizInitialCount}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetSession={handleNewChat}
      />
    </div>
  );
}

export default App;

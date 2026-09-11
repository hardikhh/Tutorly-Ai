import React, { useState, useRef, useEffect } from 'react';
import { aiClient, StudyMode } from '../services/aiClient';
import { speechService } from '../services/speechService';
import { sessionAnalytics } from '../services/sessionAnalytics';
import { KatexRenderer } from './KatexRenderer';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StudyTimerModal, CongratulationModal } from './StudyTimerModal';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  Lightbulb,
  ListOrdered,
  Layers,
  Target,
  Image,
  Flame,
  Copy,
  Check,
  Clock,
  Play,
  Pause,
  RotateCcw,
  MessageCircleQuestion,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ChatItem {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  modeUsed?: StudyMode;
  subjectUsed?: string;
  imageUrl?: string;
  timestamp: string;
}

const SESSION_STORAGE_CHAT_KEY = 'tutorly_session_chat_messages_v1';
const SESSION_STORAGE_SUBJECT_KEY = 'tutorly_session_chat_subject';
const SESSION_STORAGE_MODE_KEY = 'tutorly_session_chat_mode';

const DEFAULT_GREETING_MESSAGE: ChatItem = {
  id: 'm1',
  sender: 'ai',
  text: `👋 Hey! I'm **Tutorly**, your 24/7 personal learning coach.\n\nAsk me **any doubt** or question you have! I can chat with you freely, explain complex concepts with simple analogies (ELI5), break problems into steps, or quiz your understanding.\n\nWhat doubt can I help you clear up today?`,
  modeUsed: 'free_chat',
  subjectUsed: 'General Academic',
  timestamp: 'Just now'
};

const loadInitialMessages = (): ChatItem[] => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_CHAT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [DEFAULT_GREETING_MESSAGE];
};

interface TutorlyChatProps {
  streakDays: number;
  onOpenFlashcards: (topic: string) => void;
  onOpenQuiz: (topic: string) => void;
  onOpenSettings: () => void;
  dailyMinutes: number;
  hasLiveApiKey?: boolean;
  initialPrompt?: string | null;
  onTopicDiscussed?: (topic: string) => void;
}

export const TutorlyChat: React.FC<TutorlyChatProps> = ({
  streakDays,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenSettings,
  dailyMinutes,
  hasLiveApiKey = false,
  initialPrompt = null,
  onTopicDiscussed
}) => {
  const [subject, setSubject] = useState<string>(() => {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_SUBJECT_KEY) || 'General Academic';
    } catch {
      return 'General Academic';
    }
  });

  const [studyMode, setStudyMode] = useState<StudyMode>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_MODE_KEY);
      if (stored && ['free_chat', 'socratic', 'eli5', 'step_by_step', 'standard'].includes(stored)) {
        return stored as StudyMode;
      }
    } catch {
      // fallback
    }
    return 'free_chat';
  });

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  // Study Timer & Focus Session state
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [isCongratModalOpen, setIsCongratModalOpen] = useState<boolean>(false);
  const [timerTotalMinutes, setTimerTotalMinutes] = useState<number>(25);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionGoal, setSessionGoal] = useState<string>('Clear doubts and master topics');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const subjectsList = [
    { name: 'General Academic', icon: '🌍' },
    { name: 'Mathematics', icon: '🔢' },
    { name: 'Science & Physics', icon: '🔬' },
    { name: 'Coding & CS', icon: '💻' },
    { name: 'History & Social Studies', icon: '📚' },
    { name: 'Literature & Writing', icon: '✍️' },
    { name: 'Languages', icon: '🗣️' }
  ];

  const suggestedPrompts = [
    { text: 'I have a doubt, can you help me?', subj: 'General Academic' },
    { text: 'How does cellular photosynthesis work?', subj: 'Science & Physics' },
    { text: 'Solve 2(x + 3) = 14 step-by-step', subj: 'Mathematics' },
    { text: 'Explain the French Revolution causes', subj: 'History & Social Studies' },
    { text: 'Why is binary search O(log n)?', subj: 'Coding & CS' }
  ];

  const [messages, setMessages] = useState<ChatItem[]>(() => loadInitialMessages());

  // Automatically save messages to sessionStorage whenever updated
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save messages to sessionStorage:', e);
    }
  }, [messages]);

  // Persist subject
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_SUBJECT_KEY, subject);
    } catch {}
  }, [subject]);

  // Persist study mode
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_MODE_KEY, studyMode);
    } catch {}
  }, [studyMode]);

  // Study timer countdown tick effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsRemaining !== null && timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setTimerSecondsRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSecondsRemaining === 0 && isTimerRunning) {
      // Completed study session!
      setIsTimerRunning(false);
      setTimerSecondsRemaining(null);
      setIsCongratModalOpen(true);
      sessionAnalytics.recordFocusTime(timerTotalMinutes);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      speechService.speak("Congratulations! You completed your study session with outstanding focus!");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsRemaining, timerTotalMinutes]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasSentInitialRef = useRef<boolean>(false);
  useEffect(() => {
    if (initialPrompt && !hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleStartTimer = (minutes: number, goal: string) => {
    setTimerTotalMinutes(minutes);
    setTimerSecondsRemaining(minutes * 60);
    setSessionGoal(goal);
    setIsTimerRunning(true);
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !selectedImageName) return;

    const userMessage: ChatItem = {
      id: `msg_${Date.now()}`,
      sender: 'student',
      text: selectedImageName
        ? `[Uploaded Image: ${selectedImageName}]\n${text || 'Please explain this problem and clear my doubts.'}`
        : text,
      imageUrl: selectedImageName ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImageName(null);
    setIsLoading(true);

    // Record session statistics
    sessionAnalytics.recordDoubt(subject);
    if (onTopicDiscussed) {
      onTopicDiscussed(subject);
    }

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await aiClient.sendChatMessage(history, text, studyMode, subject);

      const aiMessage: ChatItem = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response,
        modeUsed: studyMode,
        subjectUsed: subject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      if (isVoiceActive) {
        speechService.speak(response);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "I'm right here! Feel free to ask your doubt again.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      const stopFn = speechService.startListening(
        transcript => {
          setInputText(transcript);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
      if (stopFn) setIsListening(true);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    // Strip code blocks, latex delimiters, and markdown tokens before speech
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code example provided on screen.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\$\$[\s\S]*?\$\$/g, 'formula shown.')
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/[*#_•]/g, '')
      .replace(/➔/g, 'yields')
      .trim();
    speechService.speak(cleanSpeech || text);
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageName(file.name);
    }
  };

  // Format MM:SS for countdown
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', width: '100%' }}>
      {/* Top Bar: Streak, Live Timer, Subject Chips, Mode Toggles */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Row 1: Streak Badge, Study Timer & Subject Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--developing)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <Flame size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{streakDays}-Day Learning Streak!</span>
            </div>

            {/* Study Timer Quick Trigger / Running Indicator */}
            {timerSecondsRemaining === null ? (
              <button
                onClick={() => setIsTimerModalOpen(true)}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 'var(--radius-full)', color: 'var(--secondary)' }}
              >
                <Clock size={14} /> Set Study Focus Timer
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid var(--secondary)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  color: 'var(--secondary)',
                  fontWeight: 700
                }}
              >
                <Clock size={14} className="animate-spin" />
                <span>{formatTimer(timerSecondsRemaining)} Focus</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-ghost"
                  style={{ padding: '2px', color: 'var(--text-primary)' }}
                  title={isTimerRunning ? 'Pause' : 'Resume'}
                >
                  {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsRemaining(null);
                  }}
                  className="btn-ghost"
                  style={{ padding: '2px', color: 'var(--critical-gap)' }}
                  title="Stop session"
                >
                  ✕
                </button>
              </div>
            )}

            {hasLiveApiKey ? (
              <div className="badge-live-ai" title={`Live ${aiClient.getProvider() === 'gemini' ? 'Google Gemini Flash' : 'OpenAI gpt-4o-mini'} Connected`}>
                <div className="live-dot" />
                <span>{aiClient.getProvider() === 'gemini' ? 'Gemini Flash Live' : 'gpt-4o-mini Live'}</span>
              </div>
            ) : (
              <button
                onClick={onOpenSettings}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-medium)',
                  padding: '4px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                + Connect API Key
              </button>
            )}
          </div>

          {/* Subject Pills (Scrollable) */}
          <div
            className="flex items-center gap-1"
            style={{ overflowX: 'auto', maxWidth: '580px', scrollbarWidth: 'none', padding: '2px 0' }}
          >
            {subjectsList.map(s => {
              const isSelected = subject === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => setSubject(s.name)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ marginRight: '4px' }}>{s.icon}</span>
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: AI Coaching & Doubt Modes */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              MODE:
            </span>

            {[
              { id: 'free_chat', label: '💬 Ask Any Doubt / Free Chat', icon: <MessageCircleQuestion size={14} />, tip: 'Conversational, direct answers to all doubts' },
              { id: 'socratic', label: '🧠 Socratic Coach', icon: <Brain size={14} />, tip: 'Guides you to think' },
              { id: 'eli5', label: '💡 Explain Like I\'m 5', icon: <Lightbulb size={14} />, tip: 'Super simple analogies' },
              { id: 'step_by_step', label: '📝 Step-by-Step', icon: <ListOrdered size={14} />, tip: 'Numbered steps' }
            ].map(m => {
              const isSelected = studyMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setStudyMode(m.id as StudyMode)}
                  title={m.tip}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? 'var(--primary-light)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)'
                  }}
                >
                  {m.icon}
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Quick Study Actions: Flashcards & Quiz */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFlashcards(subject)}
              className="btn-secondary"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Layers size={14} color="var(--primary-light)" /> Flashcards
            </button>
            <button
              onClick={() => onOpenQuiz(subject)}
              className="btn-secondary"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Target size={14} color="var(--mastered)" /> Quiz Me
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Messages Log */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          marginBottom: '16px'
        }}
      >
        {messages.map(msg => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isAi ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  background: isAi ? 'var(--bg-tertiary)' : 'var(--primary)',
                  color: '#ffffff',
                  border: isAi ? '1px solid var(--border-medium)' : 'none',
                  boxShadow: isAi ? 'var(--shadow-md)' : '0 4px 12px var(--primary-glow)',
                  borderBottomLeftRadius: isAi ? '4px' : 'var(--radius-lg)',
                  borderBottomRightRadius: isAi ? 'var(--radius-lg)' : '4px'
                }}
              >
                {/* Header Tag for AI */}
                {isAi && (
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Sparkles size={13} /> Tutorly AI ({aiClient.getProvider() === 'gemini' ? 'Gemini Flash' : 'gpt-4o-mini'})
                    </span>

                    <div className="flex items-center gap-2">
                      {msg.modeUsed && (
                        <span className="badge badge-learning" style={{ fontSize: '0.65rem' }}>
                          {msg.modeUsed.replace(/_/g, ' ')}
                        </span>
                      )}

                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="btn-ghost"
                        style={{ padding: '3px', color: 'var(--text-muted)' }}
                        title="Read aloud"
                      >
                        <Volume2 size={14} />
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="btn-ghost"
                        style={{ padding: '3px', color: 'var(--text-muted)' }}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={14} color="var(--mastered)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Optional Image */}
                {msg.imageUrl && (
                  <div style={{ marginBottom: '10px' }}>
                    <img
                      src={msg.imageUrl}
                      alt="Homework Problem"
                      style={{ maxWidth: '280px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}
                    />
                  </div>
                )}

                {/* Message Body */}
                {isAi ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {msg.text}
                  </div>
                )}

                {/* Interactive Action Shortcuts under AI answers */}
                {isAi && (
                  <div className="flex gap-2 flex-wrap" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      onClick={() => {
                        const priorStudent = messages
                          .slice(0, messages.findIndex(m => m.id === msg.id))
                          .reverse()
                          .find(m => m.sender === 'student');
                        const relevantTopic = priorStudent?.text ? priorStudent.text.slice(0, 40) : (msg.subjectUsed || subject);
                        onOpenQuiz(relevantTopic);
                      }}
                      style={{
                        fontSize: '0.74rem',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Generate a mastery check quiz based on this discussion"
                    >
                      <Target size={13} color="var(--mastered)" /> Quiz Me on This
                    </button>
                    <button
                      onClick={() => {
                        const priorStudent = messages
                          .slice(0, messages.findIndex(m => m.id === msg.id))
                          .reverse()
                          .find(m => m.sender === 'student');
                        const relevantTopic = priorStudent?.text ? priorStudent.text.slice(0, 40) : (msg.subjectUsed || subject);
                        onOpenFlashcards(relevantTopic);
                      }}
                      style={{
                        fontSize: '0.74rem',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Create study flashcards from this concept"
                    >
                      <Layers size={13} color="var(--primary-light)" /> Make Flashcards
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              className="glass-panel"
              style={{
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles size={16} className="animate-spin" color="var(--primary)" />
              Tutorly is answering your doubt...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {suggestedPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSubject(sp.subj);
                handleSendMessage(sp.text);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap'
              }}
            >
              💡 {sp.text}
            </button>
          ))}
        </div>
      )}

      {/* Uploaded image chip indicator */}
      {selectedImageName && (
        <div
          style={{
            padding: '6px 12px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>📸 Image Attached: <strong>{selectedImageName}</strong></span>
          <button onClick={() => setSelectedImageName(null)} className="btn-ghost" style={{ padding: '2px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {/* Hidden File Input for Homework Scan */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelected}
        />

        {/* Scan / Image Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost"
          style={{ padding: '8px' }}
          title="Scan or upload homework image"
        >
          <Image size={19} color="var(--primary-light)" />
        </button>

        {/* Voice Dictation Button */}
        <button
          onClick={handleVoiceToggle}
          className="btn-ghost"
          style={{
            padding: '8px',
            background: isListening ? 'var(--critical-gap-bg)' : 'transparent',
            color: isListening ? 'var(--critical-gap)' : 'var(--text-secondary)'
          }}
          title={isListening ? 'Stop recording voice' : 'Speak your doubt / question'}
        >
          {isListening ? <MicOff size={19} /> : <Mic size={19} />}
        </button>

        {/* Text Input Box */}
        <input
          type="text"
          placeholder={`Chat freely or ask any doubt in ${subject}...`}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '0.92rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)'
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          className="btn-primary"
          style={{ padding: '12px 18px' }}
          title="Send to Tutorly"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Study Focus Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onStartSession={handleStartTimer}
      />

      {/* Celebratory Congratulation Modal */}
      <CongratulationModal
        isOpen={isCongratModalOpen}
        onClose={() => setIsCongratModalOpen(false)}
        minutesStudied={timerTotalMinutes}
        goalText={sessionGoal}
      />
    </div>
  );
};

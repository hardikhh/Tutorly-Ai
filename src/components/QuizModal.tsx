import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  X,
  Sparkles,
  RefreshCw,
  Download,
  Zap,
  Clock,
  Pause,
  Play,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateTopicQuiz, QuizQuestion } from '../services/topicGenerator';
import { generateQuizPDF } from '../services/pdfService';
import { speechService } from '../services/speechService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  initialCount?: number;
  onQuizCompleted?: (score: number) => void;
}

const MAX_STRIKES = 3;

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  topic,
  initialCount = 15,
  onQuizCompleted
}) => {
  const [questionCount, setQuestionCount] = useState<number>(initialCount);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateTopicQuiz(topic, initialCount, true));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Timer States (Default: 60 seconds per question)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState<number>(initialCount * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialCount * 60);

  // Anti-Cheat & Tab Switch Lock States
  const [strikes, setStrikes] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);

  // Sync refs to prevent stale closure bugs in browser event listeners
  const isOpenRef = useRef(isOpen);
  const isCompletedRef = useRef(isCompleted);
  const isDownloadingRef = useRef(isDownloading);
  const strikesRef = useRef(strikes);
  const scoreRef = useRef(score);
  const onQuizCompletedRef = useRef(onQuizCompleted);
  const wasHiddenRef = useRef(false);
  const lastViolationTimeRef = useRef<number>(0);

  useEffect(() => {
    isOpenRef.current = isOpen;
    isCompletedRef.current = isCompleted;
    isDownloadingRef.current = isDownloading;
    strikesRef.current = strikes;
    scoreRef.current = score;
    onQuizCompletedRef.current = onQuizCompleted;
  });

  // Reset quiz state, strikes, and timer on topic, count, or open change
  useEffect(() => {
    if (isOpen) {
      const qs = generateTopicQuiz(topic, questionCount, true);
      const totalSecs = questionCount * 60;
      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setHasSubmitted(false);
      setScore(0);
      setIsCompleted(false);
      setStrikes(0);
      setShowViolationModal(false);
      setIsDisqualified(false);
      setTotalTimerSeconds(totalSecs);
      setSecondsRemaining(totalSecs);
      setIsTimerPaused(false);
      wasHiddenRef.current = false;
    }
  }, [topic, isOpen, questionCount]);

  // Tab switch violation trigger
  const recordViolation = () => {
    if (!isOpenRef.current || isCompletedRef.current || isDownloadingRef.current) return;

    const now = Date.now();
    // Debounce to prevent multiple triggers from consecutive blur and visibilitychange
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    const currentStrikes = strikesRef.current;
    const newStrikes = currentStrikes + 1;
    setStrikes(newStrikes);
    setShowViolationModal(true);

    if (newStrikes >= MAX_STRIKES) {
      setIsDisqualified(true);
      setIsCompleted(true);
      speechService.speak(
        `Violation limit reached. Tab switching detected ${newStrikes} times. Quiz automatically submitted.`
      );
      if (onQuizCompletedRef.current) {
        onQuizCompletedRef.current(scoreRef.current);
      }
    } else {
      speechService.speak(
        `Warning! Tab switch detected. Strike ${newStrikes} of ${MAX_STRIKES}. Please remain on the quiz screen.`
      );
    }
  };

  // Tab Switch & Visibility Change Detection
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isCompletedRef.current && !isDownloadingRef.current) {
          wasHiddenRef.current = true;
        }
      } else {
        if (wasHiddenRef.current && !isCompletedRef.current && !isDownloadingRef.current) {
          wasHiddenRef.current = false;
          recordViolation();
        }
      }
    };

    const handleWindowBlur = () => {
      if (!isCompletedRef.current && !isDownloadingRef.current) {
        wasHiddenRef.current = true;
      }
    };

    const handleWindowFocus = () => {
      if (wasHiddenRef.current && !isCompletedRef.current && !isDownloadingRef.current) {
        wasHiddenRef.current = false;
        recordViolation();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpenRef.current && !isCompletedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen]);

  // Live Timer Countdown Ticking Effect
  useEffect(() => {
    let interval: any = null;

    if (isOpen && isTimerActive && !isTimerPaused && !isCompleted && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCompleted(true);
            speechService.speak("Time's up! Here is your quiz score and full review.");
            confetti({ particleCount: 60, spread: 70 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isTimerActive, isTimerPaused, isCompleted, secondsRemaining]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  // Time format helper (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeSpentSeconds = Math.max(0, totalTimerSeconds - secondsRemaining);
  const timeSpentFormatted = formatTime(timeSpentSeconds);

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || !currentQ) return;
    setHasSubmitted(true);

    const isCorrect = selectedIndex === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIndex(null);
      setHasSubmitted(false);
    } else {
      setIsCompleted(true);
      if (score >= Math.floor(questions.length * 0.6)) {
        confetti({ particleCount: 80, spread: 70 });
      }
      if (onQuizCompleted) onQuizCompleted(score);
    }
  };

  const handleRestart = () => {
    const totalSecs = questionCount * 60;
    setQuestions(generateTopicQuiz(topic, questionCount, true));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setHasSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setTotalTimerSeconds(totalSecs);
    setSecondsRemaining(totalSecs);
    setIsTimerPaused(false);
  };

  const handleCountChange = (count: number) => {
    const totalSecs = count * 60;
    setQuestionCount(count);
    setQuestions(generateTopicQuiz(topic, count, true));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setHasSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setTotalTimerSeconds(totalSecs);
    setSecondsRemaining(totalSecs);
    setIsTimerPaused(false);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      generateQuizPDF(topic, questions, {
        score: isCompleted ? score : undefined,
        timeSpent: isTimerActive ? timeSpentFormatted : undefined
      });
      confetti({ particleCount: 40, spread: 50 });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isLowTime = isTimerActive && secondsRemaining <= 60 && secondsRemaining > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-accent)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-2">
            <Target size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Mastery Quiz: {topic}</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab-Switch Anti-Cheat Badge */}
            {!isCompleted && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: strikes > 0 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.12)',
                  border: `1px solid ${strikes > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                  color: strikes > 0 ? 'var(--critical-gap)' : 'var(--mastered)',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
                title={`Tab-switch monitoring is active. Leaving the tab records a strike (${strikes}/${MAX_STRIKES}).`}
              >
                {strikes > 0 ? <ShieldAlert size={13} className="animate-pulse" /> : <ShieldCheck size={13} />}
                <span>Tab Lock: {strikes}/{MAX_STRIKES} Strikes</span>
              </div>
            )}

            {/* Live Timer Pill */}
            {isTimerActive && !isCompleted && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: isLowTime ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                  border: `1px solid ${isLowTime ? 'var(--critical-gap)' : 'var(--secondary)'}`,
                  color: isLowTime ? 'var(--critical-gap)' : 'var(--secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  transition: 'all 0.3s'
                }}
                title={isTimerPaused ? 'Timer is paused' : 'Time remaining for quiz'}
              >
                <Clock size={13} className={isLowTime ? 'animate-pulse' : ''} />
                <span>{formatTime(secondsRemaining)}</span>

                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="btn-ghost"
                  style={{ padding: '2px', color: 'inherit' }}
                  title={isTimerPaused ? 'Resume timer' : 'Pause timer'}
                >
                  {isTimerPaused ? <Play size={12} /> : <Pause size={12} />}
                </button>
              </div>
            )}

            {/* Toggle Timer Mode Button */}
            {!isCompleted && (
              <button
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="btn-ghost"
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  color: isTimerActive ? 'var(--text-secondary)' : 'var(--mastered)'
                }}
                title={isTimerActive ? 'Switch to untimed relaxed mode' : 'Enable countdown timer'}
              >
                {isTimerActive ? 'Timed' : 'Untimed'}
              </button>
            )}

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="btn-secondary"
              style={{
                fontSize: '0.76rem',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--text-primary)'
              }}
              title="Download full quiz question paper with verified answers as PDF"
            >
              <Download size={14} color="var(--secondary)" />
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>

            <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Question Count & Tier Selection Bar */}
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Question Count & Tiers:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCountChange(5)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: questionCount === 5 ? 700 : 500,
                background: questionCount === 5 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: questionCount === 5 ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid ' + (questionCount === 5 ? 'var(--primary-light)' : 'var(--border-subtle)'),
                cursor: 'pointer'
              }}
            >
              5 Qs (5m)
            </button>

            <button
              onClick={() => handleCountChange(10)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: questionCount === 10 ? 700 : 500,
                background: questionCount === 10 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: questionCount === 10 ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid ' + (questionCount === 10 ? 'var(--primary-light)' : 'var(--border-subtle)'),
                cursor: 'pointer'
              }}
            >
              10 Qs (10m)
            </button>

            {/* 1-Step 15-Question Tiered Challenge */}
            <button
              onClick={() => handleCountChange(15)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background:
                  questionCount === 15
                    ? 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)'
                    : 'rgba(99, 102, 241, 0.15)',
                color: '#ffffff',
                border: '1px solid ' + (questionCount === 15 ? '#818cf8' : 'rgba(99, 102, 241, 0.3)'),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="1-Step Tiered Quiz: 5 Low Level + 5 Medium Level + 5 Hard Level (15m Timer)"
            >
              <Zap size={13} /> 15 Qs (5 Low + 5 Med + 5 Hard)
            </button>
          </div>
        </div>

        {/* Tab Switch Violation Overlay Modal */}
        {showViolationModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 15, 29, 0.96)',
              backdropFilter: 'blur(12px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                maxWidth: '440px',
                background: strikes >= MAX_STRIKES ? 'rgba(239, 68, 68, 0.16)' : 'rgba(245, 158, 11, 0.14)',
                border: `1px solid ${strikes >= MAX_STRIKES ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: strikes >= MAX_STRIKES ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                {strikes >= MAX_STRIKES ? (
                  <ShieldAlert size={36} color="var(--critical-gap)" />
                ) : (
                  <AlertTriangle size={36} color="var(--developing)" />
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                {strikes >= MAX_STRIKES ? 'Quiz Auto-Submitted!' : '⚠️ Tab Switch Detected!'}
              </h3>

              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: strikes >= MAX_STRIKES ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                  color: strikes >= MAX_STRIKES ? '#fca5a5' : '#fde68a',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '14px'
                }}
              >
                Strike {Math.min(strikes, MAX_STRIKES)} of {MAX_STRIKES}
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
                {strikes >= MAX_STRIKES
                  ? 'You have exceeded the maximum allowed tab switches (3/3). For academic integrity, your quiz has been locked and automatically submitted.'
                  : `Switching tabs, minimizing the browser, or leaving this assessment window is strictly prohibited. You received strike ${strikes} of ${MAX_STRIKES}. Reaching ${MAX_STRIKES} strikes will automatically end and submit your quiz.`}
              </p>

              {strikes >= MAX_STRIKES ? (
                <button
                  onClick={() => setShowViolationModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  View Final Score & Review
                </button>
              ) : (
                <button
                  onClick={() => setShowViolationModal(false)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderColor: '#ef4444'
                  }}
                >
                  I Understand, Return to Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div
          style={{ padding: '24px', userSelect: 'none' }}
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {!isCompleted && currentQ ? (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <div className="flex items-center gap-2">
                  <span className="badge badge-learning">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  {/* Difficulty Tag */}
                  {currentQ.difficulty && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background:
                          currentQ.difficulty === 'Low'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : currentQ.difficulty === 'Medium'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          currentQ.difficulty === 'Low'
                            ? 'var(--mastered)'
                            : currentQ.difficulty === 'Medium'
                            ? 'var(--developing)'
                            : 'var(--critical-gap)',
                        border: `1px solid ${
                          currentQ.difficulty === 'Low'
                            ? 'rgba(16, 185, 129, 0.4)'
                            : currentQ.difficulty === 'Medium'
                            ? 'rgba(245, 158, 11, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)'
                        }`
                      }}
                    >
                      {currentQ.difficulty} Level
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isTimerActive && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: isLowTime ? 'var(--critical-gap)' : 'var(--text-muted)',
                        fontWeight: isLowTime ? 700 : 500
                      }}
                    >
                      ⏱️ {formatTime(secondsRemaining)} left
                    </span>
                  )}

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Score: <strong>{score}</strong> / {questions.length}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', lineHeight: 1.5, color: '#ffffff' }}>
                {currentQ.prompt}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-3" style={{ marginBottom: '20px' }}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let bg = 'var(--bg-tertiary)';
                  let border = '1px solid var(--border-medium)';

                  if (hasSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.2)';
                      border = '2px solid var(--mastered)';
                    } else if (isSelected && !isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.2)';
                      border = '2px solid var(--critical-gap)';
                    }
                  } else if (isSelected) {
                    bg = 'rgba(99, 102, 241, 0.25)';
                    border = '2px solid var(--primary-light)';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasSubmitted}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: bg,
                        border,
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: hasSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', minWidth: '18px' }}>
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <span>{opt}</span>
                      </div>
                      {hasSubmitted && isCorrect && <CheckCircle2 size={18} color="var(--mastered)" />}
                      {hasSubmitted && isSelected && !isCorrect && <XCircle size={18} color="var(--critical-gap)" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback after submit */}
              {hasSubmitted && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedIndex === currentQ.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${selectedIndex === currentQ.correctIndex ? 'var(--mastered)' : 'var(--critical-gap)'}`,
                    marginBottom: '18px',
                    fontSize: '0.85rem'
                  }}
                >
                  <strong>{selectedIndex === currentQ.correctIndex ? 'Spot on! 🎉' : 'Key Insight:'}</strong> {currentQ.explanation}
                </div>
              )}

              {/* Action Button */}
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedIndex === null}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    opacity: selectedIndex !== null ? 1 : 0.5,
                    cursor: selectedIndex !== null ? 'pointer' : 'not-allowed'
                  }}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-accent"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {currentIndex + 1 === questions.length ? 'View Final Results' : 'Next Question'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            /* Completed view */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'var(--mastered-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Sparkles size={32} color="var(--mastered)" />
              </div>

              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                {isDisqualified
                  ? 'Quiz Auto-Submitted!'
                  : secondsRemaining === 0 && isTimerActive
                  ? "Time's Up!"
                  : "Mastery Check Completed!"}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '14px' }}>
                You scored <strong>{score} out of {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%) on {topic}.
              </p>

              {/* Proctor Integrity Status Banner */}
              <div style={{ marginBottom: '16px' }}>
                {isDisqualified ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: 'var(--critical-gap)',
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <ShieldAlert size={15} /> Quiz Auto-Submitted: {strikes} Tab Switch Violations Recorded
                  </div>
                ) : strikes === 0 ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: 'var(--mastered)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <ShieldCheck size={14} /> Proctor Integrity: 100% Clean (Zero Tab Switches)
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--developing)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <ShieldAlert size={14} /> Integrity Note: {strikes} Tab Switch {strikes === 1 ? 'Warning' : 'Warnings'} Logged
                  </div>
                )}
              </div>

              {/* Stats pill: Time Spent */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '22px'
                }}
              >
                <Clock size={14} color="var(--secondary)" />
                <span>
                  Time Taken: <strong>{timeSpentFormatted}</strong>
                </span>
                <span>•</span>
                <span>
                  Avg per question: <strong>{Math.round(timeSpentSeconds / questions.length)}s</strong>
                </span>
              </div>

              {/* PDF Download Prompt Banner */}
              <div
                className="glass-panel"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                    📄 Download Quiz Worksheet & Verified Answers
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Save all {questions.length} questions, options, and full step-by-step explanations as a PDF.
                  </div>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="btn-accent"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={handleRestart} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <RefreshCw size={15} /> Retake Quiz
                </button>
                <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  Back to Study Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

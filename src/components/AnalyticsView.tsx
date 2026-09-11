import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { sessionAnalytics, SessionData } from '../services/sessionAnalytics';
import {
  Sparkles,
  Brain,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Target,
  RotateCcw,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnalyticsViewProps {
  profile: StudentProfile;
  onPracticeConcept: (conceptId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onPracticeConcept
}) => {
  const [sessionData, setSessionData] = useState<SessionData>(() => sessionAnalytics.getSessionData());

  useEffect(() => {
    const unsubscribe = sessionAnalytics.subscribe(() => {
      setSessionData(sessionAnalytics.getSessionData());
    });
    return () => unsubscribe();
  }, []);

  const totalAttempted = sessionData.totalQuestionsAttempted;
  const totalCorrect = sessionData.totalQuestionsCorrect;
  const accuracyPercent = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Determine actual session calibration state
  const getCalibrationState = () => {
    if (totalAttempted === 0) {
      return {
        state: 'ready',
        title: 'Ready for Benchmark',
        desc: 'Take your first quiz in Mastery Quizzes to calibrate your performance matrix for this session.',
        advice: 'Start by asking a doubt in AI Study Chat or playing a 5-question quick quiz!'
      };
    }
    if (accuracyPercent >= 80) {
      return {
        state: 'calibrated_master',
        title: 'Calibrated Mastery (80%+)',
        desc: 'High observed accuracy and consistent concept grasp on topics tested in this session.',
        advice: 'You have solid retention! Try tackling 15-question tiered challenges or exploring new subjects.'
      };
    }
    if (accuracyPercent >= 55) {
      return {
        state: 'growth_edge',
        title: 'Active Growth Edge (55% - 79%)',
        desc: 'Good foundational comprehension with a few specific conceptual traps identified.',
        advice: 'Review the mistake insights below and ask Tutorly for step-by-step breakdowns on missed topics.'
      };
    }
    return {
      state: 'scaffolding_needed',
      title: 'Scaffolding Recommended (<55%)',
      desc: 'Emerging knowledge gaps detected on recent quiz questions.',
      advice: 'Switch to Socratic mode or ELI5 in the AI Study Chat to build intuition before re-testing.'
    };
  };

  const calibration = getCalibrationState();

  const handleResetSession = () => {
    const fresh = sessionAnalytics.resetSession();
    setSessionData(fresh);
    confetti({ particleCount: 30, spread: 50 });
  };

  // Collect all mistakes from all quiz attempts in this session
  const allSessionMistakes = sessionData.quizAttempts.flatMap(a =>
    a.mistakes.map(m => ({ ...m, quizTopic: a.topic }))
  );

  const mistakeCategoriesList = Object.entries(sessionData.mistakeCategories);
  const totalMistakesCount = mistakeCategoriesList.reduce((acc, [, count]) => acc + count, 0);

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1100px' }}>
      {/* Header with Live Session Indicator */}
      <div
        className="flex items-center justify-between flex-wrap gap-4"
        style={{ marginBottom: '28px' }}
      >
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--mastered)',
                fontSize: '0.74rem',
                fontWeight: 700
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              LIVE CURRENT SESSION
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Started at {sessionData.sessionStartTime}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Session Performance & Progress</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Real-time analytics, question accuracy, doubts cleared, and mistake logs for your current study session.
          </p>
        </div>

        <button
          onClick={handleResetSession}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          title="Reset statistics for this session"
        >
          <RotateCcw size={14} /> Reset Session Stats
        </button>
      </div>

      {/* Top 4 Live Session Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Doubts Asked */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              DOUBTS CLEARED
            </span>
            <MessageSquare size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {sessionData.doubtsAskedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Interactive AI chat questions
          </div>
        </div>

        {/* Questions Solved */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              QUESTIONS ATTEMPTED
            </span>
            <Target size={18} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {totalAttempted}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Across {sessionData.quizzesCompletedCount} quiz {sessionData.quizzesCompletedCount === 1 ? 'attempt' : 'attempts'}
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              SESSION ACCURACY
            </span>
            <Award
              size={18}
              color={
                accuracyPercent >= 80
                  ? 'var(--mastered)'
                  : accuracyPercent >= 50
                  ? 'var(--developing)'
                  : 'var(--critical-gap)'
              }
            />
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color:
                totalAttempted === 0
                  ? 'var(--text-secondary)'
                  : accuracyPercent >= 80
                  ? 'var(--mastered)'
                  : accuracyPercent >= 50
                  ? 'var(--developing)'
                  : 'var(--critical-gap)'
            }}
          >
            {totalAttempted > 0 ? `${accuracyPercent}%` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {totalAttempted > 0
              ? `${totalCorrect} correct of ${totalAttempted} total`
              : 'Complete a quiz to calculate'}
          </div>
        </div>

        {/* Session Focus Time */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              SESSION FOCUS TIME
            </span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {sessionData.sessionFocusMinutes}m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active timer & quiz focus
          </div>
        </div>
      </div>

      {/* Row 2: Metacognitive Calibration Matrix & Topics Explored */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Metacognitive Performance Matrix */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
            <Brain size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Session Performance Calibration</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '18px' }}>
            Calibrating your demonstrated session score against expected mastery tiers.
          </p>

          {/* 4 Quadrants Visual Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '18px'
            }}
          >
            {/* Quadrant 1: Master */}
            <div
              style={{
                background:
                  calibration.state === 'calibrated_master'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  calibration.state === 'calibrated_master'
                    ? '2px solid var(--mastered)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mastered)' }}>
                CALIBRATED MASTER (80%+)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                High accuracy & consistent execution
              </div>
            </div>

            {/* Quadrant 2: Growth Edge */}
            <div
              style={{
                background:
                  calibration.state === 'growth_edge'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  calibration.state === 'growth_edge'
                    ? '2px solid var(--developing)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--developing)' }}>
                GROWTH EDGE (55–79%)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Solid foundation, minor gaps
              </div>
            </div>

            {/* Quadrant 3: Scaffolding Needed */}
            <div
              style={{
                background:
                  calibration.state === 'scaffolding_needed'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  calibration.state === 'scaffolding_needed'
                    ? '2px solid var(--critical-gap)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--critical-gap)' }}>
                NEEDS SCAFFOLDING (&lt;55%)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Frequent misconceptions logged
              </div>
            </div>

            {/* Quadrant 4: Initial / Ready */}
            <div
              style={{
                background:
                  calibration.state === 'ready'
                    ? 'rgba(99, 102, 241, 0.18)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  calibration.state === 'ready'
                    ? '2px solid var(--primary-light)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                SESSION BASELINE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Awaiting first quiz results
              </div>
            </div>
          </div>

          {/* Active Status Callout */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-accent)'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '4px' }}>
              Diagnosis: {calibration.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {calibration.advice}
            </div>
          </div>
        </div>

        {/* Topics Explored This Session */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
            <BookOpen size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Topics Explored This Session</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Concepts you have engaged with in chat, flashcards, or quizzes during this active visit.
          </p>

          <div className="flex flex-col gap-2" style={{ flex: 1, overflowY: 'auto' }}>
            {sessionData.topicsStudied.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                No specific topics recorded yet. Ask a question in chat or start a quiz!
              </div>
            ) : (
              sessionData.topicsStudied.map((topic, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{topic}</span>
                  <button
                    onClick={() => onPracticeConcept(topic)}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--primary-light)' }}
                  >
                    Study <ArrowRight size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Live Mistake Patterns & Quiz Attempt History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        {/* Live Mistake Category Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Live Mistake Pattern Analysis
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '18px' }}>
            Real error categories diagnosed from questions answered incorrectly during this session.
          </p>

          {totalMistakesCount === 0 ? (
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={28} color="var(--mastered)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                Zero Mistakes in Current Session!
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {totalAttempted > 0
                  ? `Flawless execution across all ${totalAttempted} questions solved!`
                  : 'Start a quiz to analyze mistake patterns.'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mistakeCategoriesList.map(([category, count]) => {
                const percent = Math.round((count / totalMistakesCount) * 100);
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '4px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{category}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {count} {count === 1 ? 'time' : 'times'} ({percent}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Quiz History in Current Session */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Current Session Quiz Log
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '18px' }}>
            Every quiz attempt taken in this active session with scores, times, and integrity status.
          </p>

          <div className="flex flex-col gap-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {sessionData.quizAttempts.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                No quizzes completed yet in this session. Head to <strong>Mastery Quizzes</strong> to challenge yourself!
              </div>
            ) : (
              sessionData.quizAttempts.map(attempt => (
                <div
                  key={attempt.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{attempt.topic}</span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background:
                          attempt.accuracy >= 80
                            ? 'rgba(16, 185, 129, 0.2)'
                            : attempt.accuracy >= 50
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          attempt.accuracy >= 80
                            ? 'var(--mastered)'
                            : attempt.accuracy >= 50
                            ? 'var(--developing)'
                            : 'var(--critical-gap)'
                      }}
                    >
                      {attempt.score} / {attempt.totalQuestions} ({attempt.accuracy}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>⏱️ {Math.round(attempt.timeSpentSec)}s</span>
                    <span>•</span>
                    <span>Logged at {attempt.timestamp}</span>
                    <span>•</span>
                    <span>
                      {attempt.tabSwitchStrikes === 0
                        ? '🛡️ Clean session (0 tab switches)'
                        : `⚠️ ${attempt.tabSwitchStrikes} Tab Switches Recorded`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

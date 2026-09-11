import React, { useState } from 'react';
import { Clock, Play, CheckCircle2, X, Sparkles, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (minutes: number, goalText: string) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  onStartSession
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [goalText, setGoalText] = useState<string>('Clear doubts and master key concepts');

  if (!isOpen) return null;

  const presets = [10, 15, 25, 30, 45, 60];

  const handleStart = () => {
    onStartSession(selectedMinutes, goalText);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '520px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-accent)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-2">
            <Clock size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.15rem' }}>Set Study Focus Timer</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              CHOOSE STUDY DURATION:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {presets.map(mins => {
                const isSelected = selectedMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedMinutes(mins)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                      border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'center',
                      fontSize: '0.95rem'
                    }}
                  >
                    {mins} mins
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              WHAT IS YOUR STUDY GOAL FOR THIS SESSION?
            </label>
            <input
              type="text"
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              placeholder="e.g. Understand photosythesis & clear chemistry doubts"
              style={{ width: '100%', fontSize: '0.9rem' }}
            />
          </div>

          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Trophy size={18} color="var(--primary-light)" />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Studying with a timer builds deep cognitive focus. When you finish, Tutorly will celebrate your achievement!
            </div>
          </div>

          <button
            onClick={handleStart}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem' }}
          >
            <Play size={16} /> Start {selectedMinutes}-Minute Focus Session
          </button>
        </div>
      </div>
    </div>
  );
};

interface CongratulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutesStudied: number;
  goalText: string;
}

export const CongratulationModal: React.FC<CongratulationModalProps> = ({
  isOpen,
  onClose,
  minutesStudied,
  goalText
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 130,
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
          maxWidth: '520px',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--mastered)',
          overflow: 'hidden',
          textAlign: 'center',
          padding: '36px 28px',
          boxShadow: '0 0 35px var(--mastered-glow)',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--mastered-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 25px var(--mastered-glow)'
          }}
        >
          <Trophy size={40} color="var(--mastered)" />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
          🎉 Congratulations!
        </h2>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
          You completed your <strong>{minutesStudied}-Minute</strong> focused study session!
        </p>

        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            SESSION GOAL ACCOMPLISHED:
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--mastered)' }}>
            ✓ {goalText || 'Focused Learning Session'}
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Flame size={16} color="#f59e0b" fill="#f59e0b" /> +50 Study XP Earned & Daily Streak Preserved!
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-accent"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
        >
          Awesome! Continue Studying
        </button>
      </div>
    </div>
  );
};

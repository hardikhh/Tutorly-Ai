import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Compass, Sparkles, Check, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}) => {
  const [name, setName] = useState<string>(currentProfile.name);
  const [grade, setGrade] = useState<string>(currentProfile.grade);
  const [targetGoal, setTargetGoal] = useState<string>(currentProfile.targetGoal);
  const [targetExam, setTargetExam] = useState<string>(currentProfile.targetExam || 'SAT / State Assessment');
  const [dailyTimeMinutes, setDailyTimeMinutes] = useState<number>(currentProfile.dailyTimeMinutes || 30);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<
    'visual' | 'socratic' | 'step_by_step' | 'real_world'
  >(currentProfile.preferredLearningStyle || 'socratic');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...currentProfile,
      name,
      grade,
      targetGoal,
      targetExam,
      dailyTimeMinutes,
      preferredLearningStyle
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 120,
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
          maxWidth: '600px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-accent)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-2">
            <Compass size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '1.2rem' }}>Personalize Your AI Learning Coach</h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              YOUR NAME:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                CURRENT GRADE / LEVEL:
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Grade 8">Grade 8 (Middle School)</option>
                <option value="Grade 9">Grade 9 (Freshman)</option>
                <option value="Grade 10">Grade 10 (Sophomore)</option>
                <option value="Grade 11">Grade 11 (Junior)</option>
                <option value="Grade 12">Grade 12 (Senior)</option>
                <option value="College Undergraduate">College Undergraduate</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                DAILY STUDY COMMITMENT:
              </label>
              <select
                value={dailyTimeMinutes}
                onChange={e => setDailyTimeMinutes(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value={15}>15 Minutes / Day</option>
                <option value={30}>30 Minutes / Day (Recommended)</option>
                <option value={45}>45 Minutes / Day</option>
                <option value={60}>60 Minutes / Day</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              PREFERRED COACHING PEDAGOGY:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'socratic', label: 'Socratic Dialogue', desc: 'Guided inquiry & hints' },
                { id: 'visual', label: 'Visual Models', desc: 'Spatial diagrams & scale balance' },
                { id: 'step_by_step', label: 'Step-by-Step', desc: 'Sequential scaffolding' },
                { id: 'real_world', label: 'Real-World Cases', desc: 'Analogies & applications' }
              ].map(item => {
                const isSelected = preferredLearningStyle === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPreferredLearningStyle(item.id as 'visual' | 'socratic' | 'step_by_step' | 'real_world')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: isSelected ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              LEARNING GOAL:
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            Save Profile & Launch Adaptive Learning <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { StudentProfile } from '../types';
import { KNOWLEDGE_GRAPH_NODES, getConceptById } from '../data/knowledgeGraph';
import { KatexRenderer } from './KatexRenderer';
import {
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface LearningPathViewProps {
  profile: StudentProfile;
  onSelectConcept: (conceptId: string) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  profile,
  onSelectConcept
}) => {
  // Math curriculum nodes in sequence
  const orderedNodes = KNOWLEDGE_GRAPH_NODES.filter(n => n.subjectId === 'mathematics').sort(
    (a, b) => a.level - b.level
  );

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
          <Layers size={22} color="var(--primary-light)" />
          <h1 style={{ fontSize: '1.8rem' }}>Personalized Adaptive Roadmap</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Downstream concepts automatically unlock when your foundational prerequisite mastery reaches 60%+.
        </p>
      </div>

      {/* Outcome Measurement Banner (Before vs After) */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          borderLeft: '4px solid var(--mastered)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)'
        }}
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={24} color="var(--mastered)" />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Measurable Outcome: Linear Equations Progress
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Initial Diagnostic Baseline: <strong>42%</strong> ➔ Current Mastery After Interventions: <strong style={{ color: 'var(--mastered)' }}>78%</strong> (+36% gain)
            </div>
          </div>
        </div>
        <span className="badge badge-mastered" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
          +36% Verified Growth
        </span>
      </div>

      {/* Roadmap Sequence */}
      <div className="flex flex-col gap-4">
        {orderedNodes.map((node, index) => {
          const mastery = profile.masteryByConcept[node.id];
          const score = mastery ? mastery.masteryScore : 0;
          const isUnlocked = profile.unlockedConcepts.includes(node.id);
          const isMastered = score >= 85;

          return (
            <div
              key={node.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '20px 24px',
                opacity: isUnlocked ? 1 : 0.65,
                border: isUnlocked
                  ? isMastered
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid var(--border-medium)'
                  : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px'
              }}
            >
              {/* Left Column: Number & Name */}
              <div className="flex items-center gap-4" style={{ flex: 1 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isUnlocked
                      ? isMastered
                        ? 'var(--mastered-bg)'
                        : 'var(--bg-tertiary)'
                      : 'rgba(0, 0, 0, 0.4)',
                    color: isUnlocked ? (isMastered ? 'var(--mastered)' : 'var(--text-primary)') : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {node.name}
                    </h3>
                    {isMastered ? (
                      <span className="badge badge-mastered" style={{ fontSize: '0.65rem' }}>
                        Mastered
                      </span>
                    ) : isUnlocked ? (
                      <span className="badge badge-learning" style={{ fontSize: '0.65rem' }}>
                        In Progress
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {node.chapter} • Bloom Level: {node.bloomLevel}
                  </div>
                </div>
              </div>

              {/* Middle: Progress Bar */}
              <div style={{ width: '180px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '4px', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mastery</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{score}%</span>
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
                      width: `${score}%`,
                      height: '100%',
                      background:
                        score >= 85
                          ? 'var(--mastered)'
                          : score >= 60
                          ? 'var(--proficient)'
                          : score >= 40
                          ? 'var(--developing)'
                          : 'var(--learning)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Right: CTA Button */}
              <div>
                {isUnlocked ? (
                  <button
                    onClick={() => onSelectConcept(node.id)}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    <BookOpen size={15} /> Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px', opacity: 0.5 }}
                  >
                    <Lock size={14} /> Complete Prereq
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

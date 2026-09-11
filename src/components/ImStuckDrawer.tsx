import React, { useState } from 'react';
import { ConceptNode, Question } from '../types';
import { tutorAgent } from '../services/ai/tutorAgent';
import { KatexRenderer } from './KatexRenderer';
import { HelpCircle, ChevronRight, X, Sparkles, Send } from 'lucide-react';

interface ImStuckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  concept: ConceptNode;
  activeQuestion?: Question;
  onUseScaffoldReply: (replyText: string) => void;
}

export const ImStuckDrawer: React.FC<ImStuckDrawerProps> = ({
  isOpen,
  onClose,
  concept,
  activeQuestion,
  onUseScaffoldReply
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);

  if (!isOpen) return null;

  const tierData = tutorAgent.getStuckDrawerTier(selectedTier, concept, activeQuestion);

  const tiersList = [
    { tier: 1, title: 'Tier 1: Subtle Hint', desc: 'Gentle orientation clue' },
    { tier: 2, title: 'Tier 2: Simpler Example', desc: 'Same pattern with easier numbers' },
    { tier: 3, title: 'Tier 3: Visual Model', desc: 'Spatial diagram or physical metaphor' },
    { tier: 4, title: 'Tier 4: Step Breakdown', desc: 'Sequential isolated checkpoints' },
    { tier: 5, title: 'Tier 5: Guiding Choice', desc: 'Multiple choice decision prompt' },
    { tier: 6, title: 'Tier 6: Parallel Worked', desc: 'Step-by-step twin problem' },
    { tier: 7, title: 'Tier 7: Full Solution', desc: 'Complete breakdown & debrief' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>"I’m Stuck" Scaffolding</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                7 Progressive tiers of assistance (Help to think, not think for you)
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tier Selector Chips */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-subtle)',
            scrollbarWidth: 'none'
          }}
        >
          {tiersList.map(t => {
            const isSelected = selectedTier === t.tier;
            return (
              <button
                key={t.tier}
                onClick={() => setSelectedTier(t.tier)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)'
                }}
              >
                T{t.tier}
              </button>
            );
          })}
        </div>

        {/* Selected Tier Content View */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <span className="badge badge-developing">Tier {tierData.tierNumber} of 7</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {tierData.description}
            </span>
          </div>

          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>{tierData.tierTitle}</h2>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              lineHeight: 1.7,
              fontSize: '0.92rem',
              marginBottom: '20px'
            }}
          >
            <div style={{ whiteSpace: 'pre-line', marginBottom: tierData.latex ? '12px' : 0 }}>
              {tierData.guidance}
            </div>

            {tierData.latex && (
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  marginTop: '10px'
                }}
              >
                <KatexRenderer latex={tierData.latex} block />
              </div>
            )}
          </div>

          {/* Suggested reply button */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-accent)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 600, marginBottom: '8px' }}>
              SUGGESTED RESPONSE TO COACH:
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
              "{tierData.suggestedReply}"
            </div>
            <button
              onClick={() => {
                onUseScaffoldReply(tierData.suggestedReply);
                onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
            >
              <Send size={15} /> Send This Response to Coach
            </button>
          </div>
        </div>

        {/* Footer Tier Stepper */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <button
            onClick={() => setSelectedTier(prev => Math.max(1, prev - 1))}
            disabled={selectedTier === 1}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', opacity: selectedTier === 1 ? 0.5 : 1 }}
          >
            Previous Tier
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tier {selectedTier} / 7
          </span>
          <button
            onClick={() => setSelectedTier(prev => Math.min(7, prev + 1))}
            disabled={selectedTier === 7}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', opacity: selectedTier === 7 ? 0.5 : 1 }}
          >
            Next Scaffold Tier
          </button>
        </div>
      </div>
    </div>
  );
};

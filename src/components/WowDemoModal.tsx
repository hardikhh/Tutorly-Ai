import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Bot,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Brain,
  Zap
} from 'lucide-react';
import { KatexRenderer } from './KatexRenderer';

interface WowDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryInLiveApp: () => void;
}

export const WowDemoModal: React.FC<WowDemoModalProps> = ({
  isOpen,
  onClose,
  onTryInLiveApp
}) => {
  const [demoMode, setDemoMode] = useState<'chatbot_vs_coach' | 'student_a_vs_b'>('chatbot_vs_coach');
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
          maxWidth: '1050px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px var(--primary-glow)'
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Pedagogical Differentiation Showcase
                <span className="badge badge-mastered" style={{ fontSize: '0.65rem' }}>
                  Judges Demo
                </span>
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Proving why "Do not optimize for answering questions. Optimize for learning." transforms education.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode('chatbot_vs_coach')}
              className={demoMode === 'chatbot_vs_coach' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Generic Bot vs. Coach
            </button>
            <button
              onClick={() => setDemoMode('student_a_vs_b')}
              className={demoMode === 'student_a_vs_b' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Student A vs. Student B
            </button>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          {demoMode === 'chatbot_vs_coach' ? (
            /* Mode 1: Generic Chatbot vs. AI Learning Coach Side-by-Side */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  Student Prompt: "What is the answer to $2x + 5 = 15$?"
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Observe how each system responds to the exact same prompt.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Generic Chatbot (Left) */}
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={20} color="var(--critical-gap)" />
                    <strong style={{ color: 'var(--critical-gap)', fontSize: '0.95rem' }}>
                      Standard "ChatGPT / Homework Solver"
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      lineHeight: 1.6
                    }}
                  >
                    "The answer is <strong>x = 5</strong>. Here is how you solve it: 2x = 15 - 5 = 10, so x = 10 / 2 = 5."
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--critical-gap)' }}>
                    <strong>Pedagogical Failure Analysis:</strong>
                    <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.5 }}>
                      <li>Student copies answer with zero cognitive effort.</li>
                      <li>Doesn't know if student actually understood inverse operations.</li>
                      <li>No diagnosis of whether student knows negative numbers.</li>
                      <li>Leaves student dependent on AI for upcoming exam.</li>
                    </ul>
                  </div>
                </div>

                {/* AI Learning Coach (Right) */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid var(--mastered)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 0 20px var(--mastered-glow)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Compass size={20} color="var(--mastered)" />
                    <strong style={{ color: 'var(--mastered)', fontSize: '0.95rem' }}>
                      AI Learning Coach (SDG 4: Quality Education)
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      lineHeight: 1.6
                    }}
                  >
                    "I want to make sure you can solve this independently on your exam! Picture a balance scale. To isolate the $2x$ term, what operation should we undo first?"
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                      <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
                        Subtract 5 from both sides
                      </span>
                      <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
                        Divide by 2 first
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--mastered)' }}>
                    <strong>Scientifically Proven Educational Benefits:</strong>
                    <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.5 }}>
                      <li>Socratic Scaffolding forces active neural retrieval.</li>
                      <li>Diagnoses mistake type if student chooses to divide by 2 first.</li>
                      <li>Multi-signal mastery score increases only upon independent solve.</li>
                      <li>Automatically schedules 3-day spaced retention review.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Student A vs Student B Adaptive Trajectory */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  The Adaptivity Test: Same Topic ($2x+3=14$), Different Knowledge Gaps
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A static system gives them both the same lesson. Watch AI Learning Coach branch dynamically:
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Student A */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-light)' }}>
                      Student A: High Foundations, Weak Application
                    </h3>
                    <span className="badge badge-proficient">High Fundamentals</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Solid on negative numbers & one-step equations, but slips on multi-step modeling.
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      lineHeight: 1.6
                    }}
                  >
                    <strong>Coach Action for Student A:</strong>
                    <ol style={{ paddingLeft: '16px', marginTop: '6px' }}>
                      <li>Bypasses basic arithmetic definitions.</li>
                      <li>Presents a real-world scenario (Phone Plan Pricing).</li>
                      <li>Elevates difficulty to <em>Mastery Challenge</em> after 1 solve.</li>
                      <li>Unlocks Downstream: <em>Systems of Equations</em>.</li>
                    </ol>
                  </div>
                </div>

                {/* Student B */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--critical-gap)' }}>
                      Student B: Missing Prerequisite (Negative Signs)
                    </h3>
                    <span className="badge badge-critical">Root Gap Detected</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Fails $2x + 5 = 15$ because they confuse $-5 - (-8)$ at the foundational layer.
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      lineHeight: 1.6
                    }}
                  >
                    <strong>Coach Action for Student B:</strong>
                    <ol style={{ paddingLeft: '16px', marginTop: '6px' }}>
                      <li>Pauses linear equation practice immediately.</li>
                      <li>Diagnoses root gap: <em>Negative Numbers & Signs</em> (28% Mastery).</li>
                      <li>Dispatches visual thermometer analogy micro-lesson.</li>
                      <li>Only returns to linear equations once prerequisite reaches 65%.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: '18px 28px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Experience live in the platform with interactive speech, step work analysis, and dynamic knowledge DAGs.
          </div>
          <button
            onClick={() => {
              onClose();
              onTryInLiveApp();
            }}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '10px 20px' }}
          >
            Launch Live Interactive Session <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

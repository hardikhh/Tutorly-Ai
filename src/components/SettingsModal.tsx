import React, { useState } from 'react';
import { aiClient } from '../services/aiClient';
import { Settings, Key, RotateCcw, Brain, Check, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSession: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetSession
}) => {
  const [apiKey, setApiKey] = useState<string>(aiClient.getApiKey());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    aiClient.setApiKey(apiKey);
    setSavedNotice(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const provider = aiClient.getProvider();

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
          maxWidth: '560px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden'
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
            <Settings size={20} color="var(--primary-light)" />
            <h2 style={{ fontSize: '1.2rem' }}>Tutorly AI Settings</h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Model & API Key Field */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Key size={15} color="var(--primary-light)" /> AI API KEY:
              </label>
              <span className="badge badge-mastered" style={{ fontSize: '0.65rem' }}>
                {provider === 'gemini' ? 'Google Gemini Flash' : 'OpenAI gpt-4o-mini'}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
              Pre-configured with <strong>Google Gemini Flash</strong> as the default working model. If you would like to use a different key (Gemini or OpenAI), paste it below—the background will dynamically adapt to your active neural connection!
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter Gemini or OpenAI API Key..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              />
              <button onClick={handleSaveApiKey} className="btn-primary" style={{ fontSize: '0.82rem' }}>
                {savedNotice ? 'Saved!' : 'Save Key'}
              </button>
            </div>

            {savedNotice && (
              <div style={{ color: 'var(--mastered)', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> AI key updated! Live background transformation active.
              </div>
            )}
          </div>

          {/* Model info card */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Sparkles size={22} color="var(--primary-light)" />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              <strong>Default Engine:</strong> Google Gemini Flash for instant, high-intelligence multimodal pedagogical responses across all academic subjects.
            </div>
          </div>

          {/* Reset session button */}
          <div className="flex justify-between items-center" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Clear Chat Conversation</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start a fresh session with clean memory</div>
            </div>
            <button
              onClick={() => {
                onResetSession();
                onClose();
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', color: 'var(--critical-gap)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <RotateCcw size={14} /> Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

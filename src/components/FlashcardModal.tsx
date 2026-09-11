import React, { useState, useEffect } from 'react';
import { Layers, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateTopicFlashcards, Flashcard } from '../services/topicGenerator';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  topic
}) => {
  const [cards, setCards] = useState<Flashcard[]>(() => generateTopicFlashcards(topic));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setCards(generateTopicFlashcards(topic));
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
    }
  }, [topic, isOpen]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleMastered = (id: string) => {
    const updated = new Set(masteredIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setMasteredIds(updated);
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
          maxWidth: '560px',
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
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div className="flex items-center gap-2">
            <Layers size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.1rem' }}>Flashcards: {topic}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Card {currentIndex + 1} of {cards.length} • Click card to flip
          </div>

          {/* Interactive Flashcard with Flip Animation */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: '100%',
              minHeight: '220px',
              borderRadius: 'var(--radius-lg)',
              background: isFlipped
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                : 'var(--bg-tertiary)',
              border: isFlipped ? '2px solid var(--mastered)' : '1px solid var(--border-medium)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <span
              className="badge"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: isFlipped ? 'var(--mastered-bg)' : 'rgba(255, 255, 255, 0.08)',
                color: isFlipped ? 'var(--mastered)' : 'var(--text-secondary)'
              }}
            >
              {isFlipped ? 'ANSWER / BACK' : 'QUESTION / FRONT'}
            </span>

            <div style={{ fontSize: isFlipped ? '1.05rem' : '1.2rem', fontWeight: 600, lineHeight: 1.6 }}>
              {isFlipped ? currentCard.back : currentCard.front}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCw size={13} /> Tap anywhere to flip
            </div>
          </div>

          {/* Mastered toggle */}
          <div className="flex gap-2" style={{ marginTop: '20px' }}>
            <button
              onClick={() => toggleMastered(currentCard.id)}
              className="btn-secondary"
              style={{
                fontSize: '0.82rem',
                color: masteredIds.has(currentCard.id) ? 'var(--mastered)' : 'var(--text-secondary)'
              }}
            >
              <CheckCircle2 size={16} />
              {masteredIds.has(currentCard.id) ? 'Marked Mastered ✓' : 'Mark as Mastered'}
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-secondary"
            style={{ opacity: currentIndex === 0 ? 0.4 : 1, fontSize: '0.82rem' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {masteredIds.size} / {cards.length} Mastered
          </span>

          <button
            onClick={handleNext}
            className="btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            {currentIndex + 1 === cards.length ? 'Finish Deck' : 'Next Card'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

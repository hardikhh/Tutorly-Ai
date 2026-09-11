import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ConceptNode,
  TeachingMode,
  Question,
  StudentProfile
} from '../types';
import { orchestrator } from '../services/ai/orchestrator';
import { speechService } from '../services/speechService';
import { KatexRenderer } from './KatexRenderer';
import { ImStuckDrawer } from './ImStuckDrawer';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { KNOWLEDGE_GRAPH_NODES } from '../data/knowledgeGraph';

interface SocraticChatProps {
  initialConceptId?: string;
  profile: StudentProfile;
  onNavigateToConcept: (conceptId: string) => void;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  initialConceptId = 'math_linear_equations',
  profile,
  onNavigateToConcept
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('socratic_questioning');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isStuckDrawerOpen, setIsStuckDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeConcept = KNOWLEDGE_GRAPH_NODES.find(c => c.id === selectedConceptId) || KNOWLEDGE_GRAPH_NODES[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      content: `Hello ${profile.name}! I am your AI Learning Coach. My purpose is not to simply give you answers, but to help you build true conceptual mastery.\n\nWe are currently exploring **${activeConcept.name}**.\n\n${activeConcept.description}`,
      latexFormula: activeConcept.keyFormulaLatex,
      teachingMode: 'socratic_questioning',
      interactiveOptions: [
        'How does this work?',
        'Show me a real-world example',
        'Walk me through a step-by-step problem',
        'Test my understanding with a question'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setInputMessage('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'student',
      timestamp: new Date().toISOString(),
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const coachResponse = await orchestrator.handleStudentMessage(
        text,
        activeConcept.id,
        undefined,
        teachingMode,
        profile
      );
      setMessages(prev => [...prev, coachResponse]);

      // Speak aloud if sound enabled
      if (isSpeaking) {
        speechService.speak(coachResponse.content);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          content: 'I hit a brief processing hiccup. Let us take it from the top: What step would you like to explore next?'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      const stopFn = speechService.startListening(
        transcript => {
          setInputMessage(transcript);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
      if (stopFn) setIsListening(true);
    }
  };

  const handleToggleAudioOutput = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
      if (lastAiMsg) {
        speechService.speak(lastAiMsg.content);
      }
    }
  };

  // Check if student has a critical prerequisite gap for this concept
  const prereqMastery = activeConcept.prerequisites.map(pId => ({
    node: KNOWLEDGE_GRAPH_NODES.find(n => n.id === pId),
    score: profile.masteryByConcept[pId]?.masteryScore || 0
  }));
  const weakPrereq = prereqMastery.find(p => p.score < 60);

  return (
    <div className="container" style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Prerequisite Intervention Banner if needed */}
      {weakPrereq && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} color="var(--critical-gap)" />
            <div>
              <strong style={{ color: 'var(--critical-gap)', fontSize: '0.88rem' }}>
                Prerequisite Gap Detected: {weakPrereq.node?.name} ({weakPrereq.score}% Mastery)
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Mastering this prerequisite first will make {activeConcept.name} dramatically easier.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (weakPrereq.node) setSelectedConceptId(weakPrereq.node.id);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Review Prerequisite <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 180px)',
          minHeight: '620px',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Bar: Concept Picker & Teaching Mode Selector */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Concept Selector */}
          <div className="flex items-center gap-2">
            <BookOpen size={16} color="var(--primary-light)" />
            <select
              value={selectedConceptId}
              onChange={e => setSelectedConceptId(e.target.value)}
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {KNOWLEDGE_GRAPH_NODES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({profile.masteryByConcept[c.id]?.masteryScore || 0}% Mastery)
                </option>
              ))}
            </select>
          </div>

          {/* 9 Teaching Modes Dropdown */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Teaching Strategy:</span>
            <select
              value={teachingMode}
              onChange={e => setTeachingMode(e.target.value as TeachingMode)}
              style={{
                fontSize: '0.82rem',
                padding: '6px 10px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <option value="socratic_questioning">Socratic Guided Questioning</option>
              <option value="visual_explanation">Visual & Geometric Model</option>
              <option value="analogy">Metaphor & Analogy</option>
              <option value="real_world_example">Real-World Case Study</option>
              <option value="step_by_step_scaffold">Step-by-Step Scaffolding</option>
              <option value="worked_example">Worked Example with Pause</option>
              <option value="counterexample">Counterexample Proof</option>
              <option value="teach_back">Teach-Back Method</option>
              <option value="simple_explanation">Plain Language Summary</option>
            </select>
          </div>

          {/* Action Tools: "I'm Stuck" Drawer Trigger & Audio Speech Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStuckDrawerOpen(true)}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--developing)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <HelpCircle size={15} /> I'm Stuck!
            </button>

            <button
              onClick={handleToggleAudioOutput}
              className="btn-ghost"
              style={{ padding: '6px', color: isSpeaking ? 'var(--secondary)' : 'var(--text-muted)' }}
              title={isSpeaking ? 'Mute AI Voice' : 'Enable Read-Aloud Voice'}
            >
              {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
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
                    maxWidth: '82%',
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
                  {/* AI Badge & Mode Tag */}
                  {isAi && (
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Sparkles size={13} /> Socratic Coach
                      </span>
                      {msg.teachingMode && (
                        <span
                          className="badge badge-learning"
                          style={{ fontSize: '0.65rem', padding: '2px 7px' }}
                        >
                          {msg.teachingMode.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Body */}
                  <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {msg.content}
                  </div>

                  {/* Formula display if present */}
                  {msg.latexFormula && (
                    <div
                      style={{
                        margin: '12px 0',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center'
                      }}
                    >
                      <KatexRenderer latex={msg.latexFormula} block />
                    </div>
                  )}

                  {/* Interactive Options / Suggestions Chips */}
                  {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                    <div
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      {msg.interactiveOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(opt)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border-subtle)',
                            textAlign: 'left'
                          }}
                        >
                          {opt}
                        </button>
                      ))}
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
                Formulating Socratic guidance...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {/* Voice Input Button */}
          <button
            onClick={handleToggleVoice}
            className="btn-ghost"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              background: isListening ? 'var(--critical-gap-bg)' : 'transparent',
              color: isListening ? 'var(--critical-gap)' : 'var(--text-secondary)'
            }}
            title={isListening ? 'Stop Listening' : 'Speak your response (Voice Recognition)'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            placeholder="Type your reasoning, answer, or ask for guidance..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            style={{ flex: 1, padding: '12px 16px', fontSize: '0.92rem' }}
          />

          <button
            onClick={() => handleSendMessage()}
            className="btn-primary"
            style={{ padding: '12px 18px' }}
            title="Send to Coach"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* "I'm Stuck" 7-Tier Progressive Scaffolding Drawer */}
      <ImStuckDrawer
        isOpen={isStuckDrawerOpen}
        onClose={() => setIsStuckDrawerOpen(false)}
        concept={activeConcept}
        onUseScaffoldReply={reply => handleSendMessage(reply)}
      />
    </div>
  );
};

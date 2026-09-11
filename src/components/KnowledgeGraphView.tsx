import React, { useState, useMemo } from 'react';
import {
  KNOWLEDGE_GRAPH_NODES,
  SUBJECTS,
  getPrerequisiteChain
} from '../data/knowledgeGraph';
import { ConceptNode, StudentProfile, SubjectId } from '../types';
import { KatexRenderer } from './KatexRenderer';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  profile: StudentProfile;
  onSelectConceptToLearn: (conceptId: string) => void;
  onSelectConceptToPractice: (conceptId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  profile,
  onSelectConceptToLearn,
  onSelectConceptToPractice
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('mathematics');
  const [activeNodeId, setActiveNodeId] = useState<string>('math_linear_equations');

  const filteredNodes = useMemo(() => {
    return KNOWLEDGE_GRAPH_NODES.filter(n => n.subjectId === selectedSubject);
  }, [selectedSubject]);

  const activeNode = useMemo(() => {
    return filteredNodes.find(n => n.id === activeNodeId) || filteredNodes[0];
  }, [filteredNodes, activeNodeId]);

  const activeNodeMastery = useMemo(() => {
    return activeNode ? profile.masteryByConcept[activeNode.id] : undefined;
  }, [profile, activeNode]);

  // Layout node positions across levels
  const nodeLayout = useMemo(() => {
    const levelsMap: Record<number, ConceptNode[]> = {};
    filteredNodes.forEach(node => {
      const lvl = node.level || 1;
      if (!levelsMap[lvl]) levelsMap[lvl] = [];
      levelsMap[lvl].push(node);
    });

    const positions: Record<string, { x: number; y: number }> = {};
    const levelKeys = Object.keys(levelsMap).map(Number).sort((a, b) => a - b);

    levelKeys.forEach((lvl, colIndex) => {
      const colNodes = levelsMap[lvl];
      const spacingY = 460 / (colNodes.length + 1);
      colNodes.forEach((node, rowIndex) => {
        positions[node.id] = {
          x: 100 + colIndex * 190,
          y: spacingY * (rowIndex + 1)
        };
      });
    });

    return positions;
  }, [filteredNodes]);

  const getNodeColor = (nodeId: string) => {
    const mastery = profile.masteryByConcept[nodeId];
    if (!mastery) return 'var(--text-muted)';
    if (mastery.masteryScore >= 85) return 'var(--mastered)';
    if (mastery.masteryScore >= 70) return 'var(--proficient)';
    if (mastery.masteryScore >= 45) return 'var(--developing)';
    return 'var(--learning)';
  };

  const isUnlocked = (nodeId: string) => {
    return profile.unlockedConcepts.includes(nodeId);
  };

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Interactive Knowledge Graph
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Map of concept hierarchies and prerequisite dependencies. Notice how mastery unlocks downstream skills.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex gap-2">
          {SUBJECTS.map(subj => {
            const isSelected = selectedSubject === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  setSelectedSubject(subj.id);
                  const first = KNOWLEDGE_GRAPH_NODES.find(n => n.subjectId === subj.id);
                  if (first) setActiveNodeId(first.id);
                }}
                className={isSelected ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                {subj.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Graph Canvas on Left, Concept Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* SVG Graph Canvas */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            minHeight: '520px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Legend */}
          <div
            className="flex items-center gap-4"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Mastery Legend:</span>
            <span className="badge badge-mastered">Mastered (85%+)</span>
            <span className="badge badge-proficient">Proficient (70%+)</span>
            <span className="badge badge-developing">Developing (45%+)</span>
            <span className="badge badge-learning">Learning (&lt;45%)</span>
          </div>

          <svg style={{ width: '100%', height: '460px' }}>
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.25)" />
              </marker>
            </defs>

            {/* Render Prerequisite Arrows */}
            {filteredNodes.map(node => {
              const toPos = nodeLayout[node.id];
              if (!toPos) return null;

              return node.prerequisites.map(prereqId => {
                const fromPos = nodeLayout[prereqId];
                if (!fromPos) return null;

                const isTargetActive = activeNode?.id === node.id || activeNode?.id === prereqId;

                return (
                  <line
                    key={`${prereqId}->${node.id}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={isTargetActive ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.15)'}
                    strokeWidth={isTargetActive ? 2.5 : 1.5}
                    strokeDasharray={isUnlocked(node.id) ? undefined : '4,4'}
                    markerEnd="url(#arrow)"
                  />
                );
              });
            })}

            {/* Render Nodes */}
            {filteredNodes.map(node => {
              const pos = nodeLayout[node.id];
              if (!pos) return null;

              const isSelected = activeNode?.id === node.id;
              const unlocked = isUnlocked(node.id);
              const color = getNodeColor(node.id);
              const mastery = profile.masteryByConcept[node.id];
              const score = mastery ? mastery.masteryScore : 0;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setActiveNodeId(node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulse when active */}
                  {isSelected && (
                    <circle
                      r="32"
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      opacity="0.5"
                      className="animate-pulse-glow"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r="24"
                    fill="var(--bg-secondary)"
                    stroke={unlocked ? color : 'var(--border-medium)'}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Icon or Score inside Node */}
                  {unlocked ? (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="10"
                      fontWeight="700"
                      fill={color}
                      fontFamily="var(--font-mono)"
                    >
                      {score > 0 ? `${score}%` : 'New'}
                    </text>
                  ) : (
                    <g transform="translate(-7, -7)">
                      <Lock size={14} color="var(--text-muted)" />
                    </g>
                  )}

                  {/* Node Name Label */}
                  <text
                    textAnchor="middle"
                    dy="40"
                    fontSize="11"
                    fontWeight={isSelected ? 700 : 500}
                    fill={isSelected ? '#ffffff' : 'var(--text-secondary)'}
                    width="120"
                  >
                    {node.name.length > 18 ? `${node.name.slice(0, 16)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Concept Inspector Drawer */}
        {activeNode && (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
                Level {activeNode.level} • {activeNode.chapter}
              </span>
              {isUnlocked(activeNode.id) ? (
                <span className="badge badge-proficient" style={{ gap: '4px' }}>
                  <Unlock size={12} /> Unlocked
                </span>
              ) : (
                <span className="badge badge-critical" style={{ gap: '4px' }}>
                  <Lock size={12} /> Prereqs Required
                </span>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{activeNode.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {activeNode.description}
              </p>
            </div>

            {/* Formula Card if available */}
            {activeNode.keyFormulaLatex && (
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  KEY MATHEMATICAL FORMULA
                </div>
                <KatexRenderer latex={activeNode.keyFormulaLatex} block />
              </div>
            )}

            {/* Mastery & Metacognitive Status */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mastery Level:</span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: getNodeColor(activeNode.id)
                  }}
                >
                  {activeNodeMastery ? `${activeNodeMastery.masteryScore}% (${activeNodeMastery.level.toUpperCase()})` : '0% (UNKNOWN)'}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${activeNodeMastery?.masteryScore || 0}%`,
                    height: '100%',
                    background: getNodeColor(activeNode.id),
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Visual Metaphor */}
            {activeNode.visualMetaphor && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--secondary)' }}>Visual Model: </strong>
                {activeNode.visualMetaphor}
              </div>
            )}

            {/* Prerequisites list */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PREREQUISITE DEPENDENCIES:
              </div>
              {activeNode.prerequisites.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None (Foundational Concept)</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {activeNode.prerequisites.map(pId => {
                    const pNode = KNOWLEDGE_GRAPH_NODES.find(n => n.id === pId);
                    const pMastery = profile.masteryByConcept[pId];
                    const pScore = pMastery ? pMastery.masteryScore : 0;
                    return (
                      <div
                        key={pId}
                        onClick={() => setActiveNodeId(pId)}
                        className="flex items-center justify-between"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{pNode?.name || pId}</span>
                        <span
                          style={{
                            color: pScore >= 60 ? 'var(--mastered)' : 'var(--critical-gap)',
                            fontWeight: 600
                          }}
                        >
                          {pScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2" style={{ marginTop: 'auto' }}>
              <button
                onClick={() => onSelectConceptToLearn(activeNode.id)}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <BookOpen size={16} /> Socratic Lesson
              </button>
              <button
                onClick={() => onSelectConceptToPractice(activeNode.id)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Play size={16} /> Practice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

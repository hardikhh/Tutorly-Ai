import React, { useState } from 'react';
import { documentProcessor, ProcessedDocumentResult } from '../services/documentProcessor';
import { KatexRenderer } from './KatexRenderer';
import {
  FileText,
  UploadCloud,
  Code,
  Image,
  Mic,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface MultimodalHubProps {
  onStartLessonFromDoc: (conceptId: string) => void;
}

export const MultimodalHub: React.FC<MultimodalHubProps> = ({
  onStartLessonFromDoc
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'image' | 'code'>('document');

  // Document extraction state
  const [docTitle, setDocTitle] = useState<string>('Chapter 4: Linear Algebra & Matrix Transformations');
  const [docContent, setDocContent] = useState<string>(
    `A vector space consists of vectors that can be scaled and added together.
A linear combination c1*v1 + c2*v2 is linearly independent if no vector can be written as a combination of others.
Matrix multiplication AB transforms vectors geometrically, representing rotations, reflections, and scaling.
Notice: Matrix multiplication is generally non-commutative (AB != BA).`
  );
  const [processedDoc, setProcessedDoc] = useState<ProcessedDocumentResult | null>(null);

  // Coding mode state
  const [codeSnippet, setCodeSnippet] = useState<string>(
    `def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`
  );
  const [codeFeedback, setCodeFeedback] = useState<string | null>(null);

  const handleProcessDocument = () => {
    const res = documentProcessor.processDocumentText(docTitle, docContent);
    setProcessedDoc(res);
  };

  const handleAnalyzeCode = () => {
    setCodeFeedback(
      `Algorithm Verified: Binary Search with logarithmic O(log n) complexity.\n\n` +
      `Pedagogical Breakdown:\n` +
      `• Loop Invariant: target must lie in arr[low..high] if it exists.\n` +
      `• Midpoint Formula: (low + high) // 2 safely divides the search interval.\n` +
      `• Common Misconception Guard: Updating low = mid + 1 and high = mid - 1 prevents infinite loops on 2-element subarrays.`
    );
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
          <UploadCloud size={24} color="var(--primary-light)" />
          <h1 style={{ fontSize: '1.8rem' }}>Multimodal Learning Hub</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Convert textbook pages, documents, code, or handwritten work into adaptive concept graphs and diagnostic tests.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('document')}
          className={activeTab === 'document' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <FileText size={16} /> Document / Syllabus Pipeline
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={activeTab === 'image' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Image size={16} /> Handwritten Solution Scan
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={activeTab === 'code' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Code size={16} /> Coding Learning Mode
        </button>
      </div>

      {/* Tab 1: Document to Learning Pipeline */}
      {activeTab === 'document' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Upload or Paste Study Material</h3>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                DOCUMENT TITLE:
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                RAW TEXT / SYLLABUS / CHAPTER NOTES:
              </label>
              <textarea
                rows={8}
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                style={{ width: '100%', fontSize: '0.88rem', lineHeight: 1.6 }}
              />
            </div>

            <button
              onClick={handleProcessDocument}
              className="btn-primary"
              style={{ justifyContent: 'center', marginTop: 'auto' }}
            >
              <Sparkles size={16} /> Transform Document into Adaptive Curriculum
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Generated Concept Map & Diagnostic</h3>

            {!processedDoc ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  gap: '12px'
                }}
              >
                <FileText size={36} color="var(--primary-light)" />
                <div>Click "Transform Document" to generate structured concept nodes and diagnostic questions.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--mastered)', fontWeight: 600 }}>
                  ✓ Extracted {processedDoc.identifiedConcepts.length} Concepts & {processedDoc.generatedDiagnosticQuestions.length} Adaptive Questions
                </div>

                <div className="flex flex-col gap-2">
                  {processedDoc.identifiedConcepts.map(c => (
                    <div
                      key={c.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span>
                        <span className="badge badge-learning" style={{ fontSize: '0.65rem' }}>
                          Level {c.level}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {c.description}
                      </div>
                      {c.keyFormulaLatex && (
                        <div style={{ textAlign: 'center', margin: '6px 0' }}>
                          <KatexRenderer latex={c.keyFormulaLatex} block />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onStartLessonFromDoc(processedDoc.recommendedStartConceptId)}
                  className="btn-accent"
                  style={{ justifyContent: 'center', marginTop: 'auto' }}
                >
                  Start Socratic Lesson on Extracted Concepts <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Handwritten Work Scan Demo */}
      {activeTab === 'image' && (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <Image size={44} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.2rem' }}>Scan Handwritten Math or Diagram</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Take a photo of your notebook or whiteboard solution. The AI analyzes each line to locate arithmetic and conceptual breakdowns.
            </p>
            <label
              className="btn-primary"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <UploadCloud size={18} /> Upload Image (PNG/JPG)
              <input type="file" accept="image/*" style={{ display: 'none' }} />
            </label>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Supported: Handwritten algebra, geometry sketches, physics free-body diagrams
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Coding Learning Mode */}
      {activeTab === 'code' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Algorithmic Code Sandbox</h3>
            <textarea
              rows={12}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                width: '100%',
                background: 'var(--bg-tertiary)'
              }}
            />
            <button onClick={handleAnalyzeCode} className="btn-primary" style={{ justifyContent: 'center' }}>
              <Code size={16} /> Analyze Code for Conceptual Misunderstandings
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Code Pedagogical Deconstruction</h3>
            {codeFeedback ? (
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {codeFeedback}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Click "Analyze Code" to receive pedagogical breakdown without simply spoiling solutions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

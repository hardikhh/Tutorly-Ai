import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { KatexRenderer } from './KatexRenderer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Split content by code blocks: ```lang\ncode\n```
  const parseBlocks = (text: string) => {
    const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const blocks: { type: 'text' | 'code'; language?: string; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          value: text.slice(lastIndex, match.index)
        });
      }
      blocks.push({
        type: 'code',
        language: match[1] || 'code',
        value: match[2].trimEnd()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      blocks.push({
        type: 'text',
        value: text.slice(lastIndex)
      });
    }

    return blocks;
  };

  // Render inline text elements (bold, inline code, latex formulas)
  const renderInline = (str: string, keyPrefix: string) => {
    // Regex matches:
    // 1. Display math $$...$$
    // 2. Inline math $...$
    // 3. Inline code `...`
    // 4. Bold **...**
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|`[^`]+?`|\*\*[^\*]+?\*\*)/g;
    const parts = str.split(tokenRegex);

    return parts.map((part, idx) => {
      const partKey = `${keyPrefix}-${idx}`;
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2);
        return <KatexRenderer key={partKey} latex={formula} block={true} />;
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        return <KatexRenderer key={partKey} latex={formula} block={false} />;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={partKey}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.12)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.88em',
              color: 'var(--primary-light)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partKey} style={{ fontWeight: 700, color: '#ffffff' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={partKey}>{part}</span>;
    });
  };

  // Render text block paragraphs and lists
  const renderTextBlock = (text: string, blockIdx: number) => {
    const lines = text.split('\n');

    return (
      <div key={`text-block-${blockIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={`empty-${lIdx}`} style={{ height: '4px' }} />;
          }

          // Headers ### Header
          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={`h3-${lIdx}`}
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginTop: '10px',
                  marginBottom: '4px',
                  color: 'var(--secondary)'
                }}
              >
                {renderInline(trimmed.slice(4), `h3-${lIdx}`)}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div
                key={`bullet-${lIdx}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px',
                  lineHeight: 1.55
                }}
              >
                <span style={{ color: 'var(--primary-light)', userSelect: 'none' }}>•</span>
                <div style={{ flex: 1 }}>{renderInline(trimmed.slice(2), `bullet-${lIdx}`)}</div>
              </div>
            );
          }

          // Numbered lists 1. 2.
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div
                key={`num-${lIdx}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px',
                  lineHeight: 1.55
                }}
              >
                <span
                  style={{
                    color: 'var(--secondary)',
                    fontWeight: 700,
                    minWidth: '20px',
                    userSelect: 'none'
                  }}
                >
                  {numMatch[1]}.
                </span>
                <div style={{ flex: 1 }}>{renderInline(numMatch[2], `num-${lIdx}`)}</div>
              </div>
            );
          }

          // Regular paragraph line
          return (
            <div key={`line-${lIdx}`} style={{ lineHeight: 1.6 }}>
              {renderInline(line, `line-${lIdx}`)}
            </div>
          );
        })}
      </div>
    );
  };

  const blocks = parseBlocks(content);

  return (
    <div className={`markdown-body ${className}`} style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
      {blocks.map((block, idx) => {
        if (block.type === 'text') {
          return renderTextBlock(block.value, idx);
        }

        // Code block
        return (
          <div
            key={`code-block-${idx}`}
            style={{
              margin: '12px 0',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#0d1117',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Header bar of code block */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Terminal size={13} color="var(--primary-light)" />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {block.language || 'code'}
                </span>
              </div>

              <button
                onClick={() => handleCopyCode(block.value, idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: copiedCodeIndex === idx ? 'var(--mastered)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  transition: 'all 0.2s'
                }}
              >
                {copiedCodeIndex === idx ? (
                  <>
                    <Check size={12} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                overflowX: 'auto',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                color: '#e6edf3',
                backgroundColor: 'transparent'
              }}
            >
              <code>{block.value}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
};

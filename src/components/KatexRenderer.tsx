import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export const KatexRenderer: React.FC<KatexRendererProps> = ({
  latex,
  block = false,
  className = ''
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: block,
        throwOnError: false,
        strict: false
      });
    } catch {
      return latex;
    }
  }, [latex, block]);

  return (
    <span
      className={`katex-wrapper ${block ? 'block text-center my-2' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

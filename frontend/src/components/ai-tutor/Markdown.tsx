import React from 'react';

/**
 * Yengil markdown renderer - tashqi paketga bog'liq emas.
 * AI javoblarini chiroyli formatlangan ko'rinishda chiqaradi:
 * ## sarlavhalar, **qalin**, `kod`, ```kod bloklari```, - ro'yxatlar.
 */

interface MarkdownProps {
  content: string;
}

// Matn ichidagi inline formatlash: **qalin** va `kod`
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // **qalin** va `kod` ni ajratish
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);

  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} style={{ color: 'var(--text, #f5f5f7)', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-c-${i}`} style={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<span key={`${keyPrefix}-t-${i}`}>{part}</span>);
    }
  });

  return nodes;
}

// Sarlavhadagi holat belgisiga qarab rang
function statusAccent(text: string): string | null {
  if (text.includes('✅') || text.includes('joyida') || text.toLowerCase().includes('togri')) return 'var(--ok, #34d399)';
  if (text.includes('⚠️') || text.toLowerCase().includes('ogohlantirish')) return 'var(--warn, #fbbf24)';
  if (text.includes('❌') || text.toLowerCase().includes('xato')) return 'var(--err, #f87171)';
  return null;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = [...listBuffer];
    listBuffer = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} style={styles.ul}>
        {items.map((item, idx) => {
          const accent = statusAccent(item);
          return (
            <li key={idx} style={{ ...styles.li, ...(accent ? { borderLeftColor: accent } : {}) }}>
              {renderInline(item, `li-${blocks.length}-${idx}`)}
            </li>
          );
        })}
      </ul>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // Kod bloki ```
    const fenceMatch = line.trim().match(/^```(\w*)/);
    if (fenceMatch) {
      flushList();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // yopuvchi ``` ni o'tkazish
      blocks.push(
        <pre key={`pre-${blocks.length}`} style={styles.codeBlock}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Sarlavha ## yoki ###
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const text = headingMatch[2];
      const accent = statusAccent(text);
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          style={{ ...styles.heading, ...(accent ? { color: accent } : {}) }}
        >
          {renderInline(text, `h-${blocks.length}`)}
        </h4>
      );
      i++;
      continue;
    }

    // Ro'yxat elementi - yoki *
    const listMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (listMatch) {
      listBuffer.push(listMatch[1]);
      i++;
      continue;
    }

    // Bo'sh qator
    if (line.trim() === '') {
      flushList();
      i++;
      continue;
    }

    // Oddiy paragraf
    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} style={styles.paragraph}>
        {renderInline(line, `p-${blocks.length}`)}
      </p>
    );
    i++;
  }

  flushList();

  return <div style={styles.container}>{blocks}</div>;
};

const styles: Record<string, React.CSSProperties> = {
  container: { fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted, #c4c4c8)' },
  heading: {
    margin: '14px 0 6px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text, #f5f5f7)',
    letterSpacing: '-0.01em',
  },
  paragraph: { margin: '6px 0' },
  ul: { margin: '6px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 },
  li: {
    margin: 0,
    padding: '5px 10px',
    background: 'rgba(255,255,255,0.03)',
    borderLeft: '2px solid var(--border-hi, rgba(255,255,255,0.16))',
    borderRadius: 6,
  },
  inlineCode: {
    fontFamily: "var(--mono, 'SF Mono', monospace)",
    background: 'rgba(0,113,227,0.15)',
    color: '#5eb3ff',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 12.5,
  },
  codeBlock: {
    margin: '8px 0',
    padding: '12px 14px',
    background: '#0d0d0f',
    border: '1px solid var(--border, rgba(255,255,255,0.09))',
    borderRadius: 8,
    overflowX: 'auto',
    fontFamily: "var(--mono, 'SF Mono', monospace)",
    fontSize: 12.5,
    lineHeight: 1.5,
    color: '#d4d4d8',
  },
};

export default Markdown;

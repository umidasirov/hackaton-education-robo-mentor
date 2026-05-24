import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/useEditorStore';
import { registerSmartCompletion } from '../../hooks/useSmartCompletion';
import { Sparkles } from 'lucide-react';

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['ino', 'cpp', 'c', 'cc', 'h', 'hpp'].includes(ext)) return 'cpp';
  if (ext === 'py') return 'python';
  if (ext === 'json') return 'json';
  if (ext === 'md') return 'markdown';
  return 'plaintext';
}

export const CodeEditor = () => {
  const { files, activeFileId, setFileContent, theme, fontSize } =
    useEditorStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  // Sxemaga qarab fikrlaydigan AI taklifi yoqilganmi
  const [aiSuggest, setAiSuggest] = useState(true);

  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleMount = (editor: any, monaco: any) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    // Avvalgi provider bo'lsa tozalash
    cleanupRef.current?.();
    cleanupRef.current = registerSmartCompletion(monaco, editor, {
      enabled: aiSuggest,
    });
  };

  const toggleAi = () => {
    const next = !aiSuggest;
    setAiSuggest(next);
    // Provider'ni qayta ro'yxatdan o'tkazish
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (monacoRef.current && editorRef.current) {
      cleanupRef.current = registerSmartCompletion(
        monacoRef.current,
        editorRef.current,
        { enabled: next }
      );
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Sxemaga asoslangan AI taklifi tugmasi */}
      <button
        onClick={toggleAi}
        title={
          aiSuggest
            ? "Sxemaga asoslangan AI taklifi yoniq (o'chirish)"
            : 'AI taklifi o\'chiq (yoqish)'
        }
        style={{
          position: 'absolute',
          top: 8,
          right: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          borderRadius: 100,
          border: `1px solid ${aiSuggest ? 'rgba(0,113,227,0.4)' : 'rgba(255,255,255,0.12)'}`,
          background: aiSuggest ? 'rgba(0,113,227,0.15)' : 'rgba(40,40,42,0.85)',
          color: aiSuggest ? '#5eb3ff' : '#86868b',
          fontSize: 11.5,
          fontWeight: 500,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font, -apple-system, sans-serif)',
        }}
      >
        <Sparkles size={12} />
        AI taklif
      </button>

      <Editor
        // key forces a fresh editor instance per file (preserves undo/redo per file)
        key={activeFileId}
        height="100%"
        language={activeFile ? getLanguage(activeFile.name) : 'cpp'}
        theme={theme}
        value={activeFile?.content ?? ''}
        onMount={handleMount}
        onChange={(value) => {
          if (activeFileId) setFileContent(activeFileId, value || '');
        }}
        options={{
          minimap: { enabled: true },
          fontSize,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          // Inline AI taklifi (ghost text) yoqilgan
          inlineSuggest: { enabled: true },
        }}
      />
    </div>
  );
};

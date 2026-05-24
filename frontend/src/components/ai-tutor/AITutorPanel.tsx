import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import axios from 'axios';
import {
  MessageCircle, Send, Loader, AlertCircle, X, Sparkles, Zap, RefreshCw,
} from 'lucide-react';
import { NotificationModal } from './NotificationModal';
import type { NotificationData } from './NotificationModal';
import { Markdown } from './Markdown';
import { useCircuitIssuesStore } from '../../store/useCircuitIssuesStore';
import './AITutorPanel.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'analysis' | 'explanation' | 'debug' | 'info' | 'realtime';
  format?: 'markdown' | 'text';
}

// Real vaqtli avtomatik tekshiruv kechikishi (ms)

export const AITutorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorAvailable, setTutorAvailable] = useState(false);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { files, activeFileId } = useEditorStore();
  const { components, wires } = useSimulatorStore();
  const setScanIssues = useCircuitIssuesStore((s) => s.setScanIssues);
  const autoCheck = useCircuitIssuesStore((s) => s.autoScanEnabled);
  const setAutoCheck = useCircuitIssuesStore((s) => s.setAutoScanEnabled);

  const notify = useCallback((data: NotificationData) => setNotification(data), []);

  // ── Sxema ma'lumotini yig'ish (pin nomlari bilan) ──────────────────────
  const buildPayload = useCallback(() => {
    const activeFile = files.find(f => f.id === activeFileId);
    return {
      code: activeFile?.content ?? '',
      components: components.map(c => ({
        type: (c as any).metadataId || (c as any).type,
        id: c.id,
        properties: c.properties,
      })),
      connections: wires.map(w => ({
        from: w.start.componentId,
        fromPin: w.start.pinName,
        to: w.end.componentId,
        toPin: w.end.pinName,
      })),
    };
  }, [files, activeFileId, components, wires]);

  // ── AI repetitor mavjudligini tekshirish ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/ai-tutor/status');
        setTutorAvailable(res.data.available);
        if (!res.data.available) {
          notify({
            type: 'warning',
            title: 'AI Repetitor sozlanmagan',
            message: "Uni yoqish uchun GROQ_API_KEY muhit o'zgaruvchisini o'rnating.",
          });
        }
      } catch {
        setTutorAvailable(false);
        notify({
          type: 'error',
          title: "Ulanib bo'lmadi",
          message: "AI Repetitor serveriga ulanib bo'lmadi. Server ishlayotganini tekshiring.",
        });
      }
    })();
  }, [notify]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const pushMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}`, timestamp: new Date() }]);
  };

  // ── Real vaqtli to'liq tekshiruv (kod + sxema + simlar) ────────────────
  const runCircuitCheck = useCallback(async (silent = false) => {
    if (!tutorAvailable) {
      if (!silent) {
        notify({ type: 'error', title: 'AI Repetitor mavjud emas', message: "Administrator bilan bog'laning." });
      }
      return;
    }
    const payload = buildPayload();
    if (!payload.code.trim() && payload.components.length === 0) {
      if (!silent) {
        notify({ type: 'info', title: "Ma'lumot yo'q", message: "Avval kod yozing yoki sxemaga komponent qo'shing." });
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/ai-tutor/check-circuit', { ...payload, mode: 'scan' });
      if (res.data.success) {
        pushMessage({ role: 'assistant', content: res.data.report, type: 'realtime', format: 'markdown' });
        // Aniqlangan xatolarni canvas chaqmoq belgilari uchun saqlash
        // Scan rejimi: maslahat/ogohlantirishlar (portlash emas)
        setScanIssues(Array.isArray(res.data.issues) ? res.data.issues : []);
      } else if (!silent) {
        notify({ type: 'error', title: 'Tekshiruv amalga oshmadi', message: res.data.error || "Noma'lum xatolik." });
      }
    } catch (e) {
      if (!silent) {
        notify({ type: 'error', title: 'Xatolik', message: e instanceof Error ? e.message : "Noma'lum xatolik." });
      }
    } finally {
      setIsLoading(false);
    }
  }, [tutorAvailable, buildPayload, notify]);

  // ── Avtomatik tekshiruv endi CircuitWatcher (fon kuzatuvchisi) tomonidan
  //    bajariladi - panel ochiq-yopiqligidan qat'i nazar ishlaydi.
  //    Bu yerda takror so'rov yubormaymiz.

  // ── Tushuncha tushuntirish ──────────────────────────────────────────────
  const explainConcept = async (concept: string) => {
    if (!tutorAvailable) {
      notify({ type: 'error', title: 'AI Repetitor mavjud emas', message: 'Hozircha mavjud emas.' });
      return;
    }
    setIsLoading(true);
    try {
      pushMessage({ role: 'user', content: `📚 Tushuntiring: "${concept}"`, type: 'explanation' });
      const res = await axios.post('/api/ai-tutor/explain-concept', {
        concept,
        context: `Talaba quyidagi komponentlar bilan ishlamoqda: ${components.map(c => (c as any).metadataId || (c as any).type).join(', ') || "hali yo'q"}`,
      });
      if (res.data.success) {
        pushMessage({ role: 'assistant', content: res.data.explanation, type: 'explanation', format: 'markdown' });
      } else {
        notify({ type: 'error', title: "Tushuntirib bo'lmadi", message: res.data.error || "Noma'lum xatolik." });
      }
    } catch (e) {
      notify({ type: 'error', title: 'Xatolik', message: e instanceof Error ? e.message : "Noma'lum xatolik." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Erkin savol / buyruqlar ─────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userInput = inputValue.trim();
    setInputValue('');

    if (userInput.toLowerCase().startsWith('/check') || userInput.toLowerCase().startsWith('/analyze')) {
      pushMessage({ role: 'user', content: '🔍 Sxema va kodni tekshir', type: 'realtime' });
      await runCircuitCheck(false);
      return;
    }
    if (userInput.toLowerCase().startsWith('/explain')) {
      const c = userInput.substring(8).trim();
      if (c) await explainConcept(c);
      else notify({ type: 'info', title: 'Foydalanish', message: '/explain [tushuncha nomi]' });
      return;
    }

    // Aks holda: erkin savol -> debug-issue orqali kontekst bilan
    pushMessage({ role: 'user', content: userInput });
    if (!tutorAvailable) {
      notify({ type: 'error', title: 'AI Repetitor mavjud emas', message: 'Hozircha mavjud emas.' });
      return;
    }
    setIsLoading(true);
    try {
      const payload = buildPayload();
      // Loyiha kontekstini qo'shish (agar Projects sahifasidan kelgan bo'lsa)
      let projectHint = '';
      try { projectHint = localStorage.getItem('velxio-ai-project-context') || ''; } catch {}
      const res = await axios.post('/api/ai-tutor/debug-issue', {
        issue: projectHint ? `[Loyiha konteksti: ${projectHint}] ${userInput}` : userInput,
        code: payload.code,
      });
      if (res.data.success) {
        pushMessage({ role: 'assistant', content: res.data.help, type: 'debug', format: 'markdown' });
      } else {
        notify({ type: 'error', title: 'Javob olinmadi', message: res.data.error || "Noma'lum xatolik." });
      }
    } catch (e) {
      notify({ type: 'error', title: 'Xatolik', message: e instanceof Error ? e.message : "Noma'lum xatolik." });
    } finally {
      setIsLoading(false);
    }
  };

  const compCount = components.length;
  const wireCount = wires.length;

  return (
    <div className="ai-tutor-container">
      <NotificationModal notification={notification} onClose={() => setNotification(null)} />

      <button
        className="ai-tutor-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Repetitor"
      >
        <Sparkles size={20} />
      </button>

      {isOpen && (
        <div className="ai-tutor-panel">
          {/* Sarlavha */}
          <div className="ai-tutor-header">
            <div className="ai-tutor-title">
              <div className="ai-tutor-logo"><Sparkles size={16} /></div>
              <div>
                <h3>AI Repetitor</h3>
                <span className="ai-tutor-subtitle">Real vaqtli sxema yordamchisi</span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>

          {/* Holat paneli */}
          <div className="ai-status-bar">
            <span className={`ai-dot ${tutorAvailable ? 'on' : 'off'}`} />
            <span className="ai-status-text">
              {tutorAvailable ? 'Faol' : 'Sozlanmagan'}
            </span>
            <span className="ai-chip">{compCount} komponent</span>
            <span className="ai-chip">{wireCount} sim</span>
            <button
              className={`ai-auto-toggle ${autoCheck ? 'active' : ''}`}
              onClick={() => setAutoCheck(!autoCheck)}
              title="Kod yoki sim o'zgarsa avtomatik tekshirish"
            >
              <Zap size={12} /> Avto
            </button>
          </div>

          {!tutorAvailable && (
            <div className="ai-warning">
              <AlertCircle size={15} />
              <span>GROQ_API_KEY o'rnatilmagan. Yoqish uchun sozlang.</span>
            </div>
          )}

          {/* Xabarlar */}
          <div className="ai-tutor-messages">
            {messages.length === 0 && (() => {
              // Loyiha konteksti bormi tekshirish
              let projectCtx: any = null;
              try {
                const raw = localStorage.getItem('velxio-ai-project-context');
                if (raw) projectCtx = JSON.parse(raw);
              } catch {}

              if (projectCtx?.title) {
                // LOYIHA REJIMI — yo'naltiruvchi salom
                return (
                  <div className="ai-welcome">
                    <div className="ai-welcome-icon"><Sparkles size={28} /></div>
                    <h4>🎯 {projectCtx.title}</h4>
                    <p>Siz bu loyihani noldan yasayapsiz. Men sizga bosqichma-bosqich yordam beraman!</p>
                    <div className="ai-feature-grid">
                      <div className="ai-feature">📦 Komponent qo'shishda yordam</div>
                      <div className="ai-feature">🔌 Simlarni tekshirish</div>
                      <div className="ai-feature">💡 Kod yozishda maslahat</div>
                      <div className="ai-feature">✅ To'g'ri ketayaptimi tekshirish</div>
                    </div>
                    <p className="ai-welcome-hint">
                      Boshlang — birinchi komponentni qo'shing. Men avtomatik tekshirib turaman
                      va kerak bo'lsa maslahat beraman. Savol bo'lsa yozing!
                    </p>
                  </div>
                );
              }

              // ODDIY REJIM
              return (
                <div className="ai-welcome">
                  <div className="ai-welcome-icon"><Sparkles size={28} /></div>
                  <h4>Salom! 👋</h4>
                  <p>Men sizning sxemangiz va kodingizni real vaqtda kuzataman.</p>
                  <div className="ai-feature-grid">
                    <div className="ai-feature">🔌 Sim ulanishlarini tekshirish</div>
                    <div className="ai-feature">🐛 Xatolarni topish</div>
                    <div className="ai-feature">💡 Tuzatish maslahatlari</div>
                    <div className="ai-feature">📚 Tushunchalarni tushuntirish</div>
                  </div>
                  <p className="ai-welcome-hint">
                    Boshlash uchun pastdagi tugmani bosing.
                  </p>
                </div>
              );
            })()}

            {messages.map(msg => (
              <div key={msg.id} className={`ai-message ${msg.role} ${msg.type || ''}`}>
                {msg.role === 'assistant' && msg.type === 'realtime' && (
                  <div className="ai-message-badge"><Zap size={11} /> Real vaqtli tekshiruv</div>
                )}
                <div className="ai-message-content">
                  {msg.format === 'markdown'
                    ? <Markdown content={msg.content} />
                    : <span>{msg.content}</span>}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message assistant loading">
                <Loader size={15} className="spinner" />
                <span>Tahlil qilinmoqda...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Tezkor amallar */}
          <div className="ai-quick-actions">
            <button className="ai-action-primary" onClick={() => runCircuitCheck(false)} disabled={isLoading}>
              <RefreshCw size={14} /> Hozir tekshir
            </button>
            <button className="ai-action-ghost" onClick={() => explainConcept('PWM')} disabled={isLoading}>
              PWM
            </button>
            <button className="ai-action-ghost" onClick={() => explainConcept('Serial aloqa')} disabled={isLoading}>
              Serial
            </button>
          </div>

          {/* Kiritish */}
          <div className="ai-tutor-input">
            <input
              type="text"
              placeholder="Savol bering yoki /check, /explain ..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
              disabled={!tutorAvailable || isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !tutorAvailable || isLoading}
              className="ai-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutorPanel;

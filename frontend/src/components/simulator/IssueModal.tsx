import React, { useState } from 'react';
import axios from 'axios';
import {
  Zap, X, MapPin, AlertTriangle, Lightbulb,
  GraduationCap, ArrowRight, Loader,
} from 'lucide-react';
import { useCircuitIssuesStore } from '../../store/useCircuitIssuesStore';
import type { IssueSeverity } from '../../store/useCircuitIssuesStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useEditorStore } from '../../store/useEditorStore';
import { Markdown } from '../ai-tutor/Markdown';

/**
 * Sxema/kod muammosi modali - O'RGATUVCHI REJIM bilan.
 *
 * Muammo topilganda (kodda yoki sxemada - farqi yo'q), talabaga darrov
 * yechim berilmaydi. Pedagogik yondashuv:
 *   1) Muammo ko'rsatiladi (qayerda, nima)
 *   2) Talaba "O'zim tuzatishga urinaman" yoki "Yordam ber" ni tanlaydi
 *   3) Yordam 3 bosqichda: ishora -> kuchli maslahat -> to'liq yechim + nega
 *   4) Oxirida: bu xato nega kelib chiqdi va qanday qaytarmaslik kerak
 */

const SEVERITY_META: Record<
  IssueSeverity,
  { color: string; label: string; title: string }
> = {
  danger: { color: '#ff3b30', label: 'Zarar xavfi', title: 'Komponentga zarar yetishi mumkin!' },
  error: { color: '#ff453a', label: 'Xato', title: 'Muammo topildi' },
  warning: { color: '#ffd60a', label: 'Ogohlantirish', title: 'Diqqat talab qiladi' },
  info: { color: '#0a84ff', label: 'Maslahat', title: 'Yaxshilash mumkin' },
};

export const IssueModal: React.FC = () => {
  const activeIssue = useCircuitIssuesStore((s) => s.activeIssue);
  const closeIssue = useCircuitIssuesStore((s) => s.closeIssue);
  const components = useSimulatorStore((s) => s.components);
  const wires = useSimulatorStore((s) => s.wires);
  const { files, activeFileId } = useEditorStore();

  // O'rgatuvchi rejim holati
  const [attempt, setAttempt] = useState(0); // 0 = boshlang'ich, 1-3 = yordam bosqichlari
  const [helpText, setHelpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  // Modal yopilganda holatni tiklash
  const handleClose = () => {
    setAttempt(0);
    setHelpText('');
    setIsFinal(false);
    closeIssue();
  };

  if (!activeIssue) return null;

  const meta = SEVERITY_META[activeIssue.severity] || SEVERITY_META.warning;
  const color = meta.color;
  const isDanger = activeIssue.severity === 'danger';

  const comp = components.find((c) => c.id === activeIssue.componentId);
  const compName =
    (comp as any)?.metadataId || (comp as any)?.type || activeIssue.componentId || 'Komponent';

  // Bosqichli yordam so'rash
  const requestHelp = async (nextAttempt: number) => {
    setLoading(true);
    try {
      const activeFile = files.find((f) => f.id === activeFileId);
      const res = await axios.post('/api/ai-tutor/guided-help', {
        problem: `${activeIssue.message}${activeIssue.why ? ' (' + activeIssue.why + ')' : ''}`,
        attempt: nextAttempt,
        code: activeFile?.content ?? '',
        components: components.map((c: any) => ({
          type: c.metadataId || c.type, id: c.id, properties: c.properties,
        })),
        connections: wires.map((w: any) => ({
          from: w.start.componentId, fromPin: w.start.pinName,
          to: w.end.componentId, toPin: w.end.pinName,
        })),
        where: `${compName}${activeIssue.pin ? ' / ' + activeIssue.pin + ' pin' : ''}`,
      });
      if (res.data?.success) {
        setHelpText(res.data.help || '');
        setIsFinal(Boolean(res.data.is_final));
        setAttempt(nextAttempt);
      } else {
        setHelpText(res.data?.error || "Yordam olishda xatolik. Internetni tekshiring.");
      }
    } catch {
      setHelpText("AI yordamchiga ulanib bo'lmadi. Server ishlayotganini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const attemptsLeft = Math.max(0, 3 - attempt);

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div
        style={{ ...styles.modal, boxShadow: `0 16px 50px rgba(0,0,0,0.55), 0 0 0 1px ${color}44` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ ...styles.topBar, background: color }} />

        {/* Sarlavha */}
        <div style={styles.header}>
          <div
            style={{
              ...styles.iconWrap, background: color,
              animation: isDanger ? 'modalDangerPulse 0.8s ease-in-out infinite' : undefined,
            }}
          >
            {isDanger
              ? <AlertTriangle size={20} fill="#1a1a1a" strokeWidth={0} />
              : <Zap size={20} fill="#1a1a1a" strokeWidth={0} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.badge, color }}>{meta.label}</div>
            <h3 style={styles.title}>{meta.title}</h3>
          </div>
          <button style={styles.closeBtn} onClick={handleClose}><X size={18} /></button>
        </div>

        {/* Qayerda */}
        <div style={styles.row}>
          <div style={styles.rowIcon}><MapPin size={15} /></div>
          <div style={{ flex: 1 }}>
            <div style={styles.rowLabel}>Qayerda</div>
            <div style={styles.rowText}>
              <strong style={{ color: '#f5f5f7' }}>{compName}</strong>
              {activeIssue.pin && <> — <code style={styles.pinCode}>{activeIssue.pin}</code> pini</>}
            </div>
          </div>
        </div>

        {/* Muammo */}
        <div style={styles.row}>
          <div style={{ ...styles.rowIcon, color }}><Zap size={15} /></div>
          <div style={{ flex: 1 }}>
            <div style={styles.rowLabel}>Muammo</div>
            <div style={styles.rowText}>{activeIssue.message}</div>
          </div>
        </div>

        {/* ── BOSHLANG'ICH: talaba tanlaydi ───────────────────────────── */}
        {attempt === 0 && !loading && (
          <>
            <div style={styles.learnBox}>
              <div style={styles.learnHeader}>
                <GraduationCap size={15} style={{ color: '#0a84ff' }} />
                <span style={styles.learnTitle}>O'rganish rejimi</span>
              </div>
              <p style={styles.learnText}>
                Bu muammoni o'zingiz tuzatishga harakat qiling — shunda yaxshiroq
                o'rganasiz. Kerak bo'lsa, men bosqichma-bosqich yordam beraman
                (3 marta). Tayyormisiz?
              </p>
            </div>
            <div style={styles.btnRow}>
              <button style={{ ...styles.btnGhost }} onClick={handleClose}>
                O'zim tuzataman
              </button>
              <button
                style={{ ...styles.btnPrimary, background: '#0a84ff' }}
                onClick={() => requestHelp(1)}
              >
                <Lightbulb size={15} /> Ishora ber
              </button>
            </div>
          </>
        )}

        {/* ── YUKLANMOQDA ──────────────────────────────────────────────── */}
        {loading && (
          <div style={styles.loadingBox}>
            <Loader size={18} className="issueSpin" />
            <span>O'ylayapman...</span>
          </div>
        )}

        {/* ── YORDAM BOSQICHI ──────────────────────────────────────────── */}
        {attempt >= 1 && !loading && (
          <>
            {/* Bosqich ko'rsatkichi */}
            <div style={styles.stepBar}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    ...styles.stepDot,
                    background: n <= attempt ? '#0a84ff' : 'var(--bg-elevated, #2c2c2e)',
                    color: n <= attempt ? '#fff' : 'var(--text-dim, #6e6e73)',
                  }}
                >
                  {n}
                </div>
              ))}
              <span style={styles.stepLabel}>
                {isFinal ? 'To\'liq yechim' : `${attempt}-ishora`}
              </span>
            </div>

            {/* AI yordami (markdown) */}
            <div style={{
              ...styles.helpBox,
              borderColor: isFinal ? 'rgba(52,211,153,0.3)' : 'rgba(10,132,255,0.25)',
              background: isFinal ? 'rgba(52,211,153,0.06)' : 'rgba(10,132,255,0.05)',
            }}>
              <Markdown content={helpText} />
            </div>

            {/* Tugmalar */}
            {!isFinal ? (
              <div style={styles.btnRow}>
                <button
                  style={styles.btnGhost}
                  onClick={() => requestHelp(attempt + 1)}
                >
                  {attemptsLeft > 1
                    ? `Hali ham tushunmadim (${attemptsLeft - 1} ta yordam qoldi)`
                    : 'To\'liq yechimni ko\'rsat'}
                  <ArrowRight size={14} />
                </button>
                <button
                  style={{ ...styles.btnPrimary, background: '#34d399' }}
                  onClick={handleClose}
                >
                  Tushundim, sinab ko'raman
                </button>
              </div>
            ) : (
              <button
                style={{ ...styles.gotIt, background: color }}
                onClick={handleClose}
              >
                Tushunarli, yopish
              </button>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes issueFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalDangerPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .issueSpin { animation: issueSpinKf 1s linear infinite; }
        @keyframes issueSpinKf { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2100, backdropFilter: 'blur(3px)', animation: 'issueFadeIn 0.15s ease',
  },
  modal: {
    position: 'relative', background: 'var(--bg-card, #141416)',
    border: '1px solid var(--border, rgba(255,255,255,0.09))',
    borderRadius: 'var(--radius, 18px)', padding: '24px 22px 22px',
    width: 'min(460px, 93vw)', maxHeight: '90vh', overflowY: 'auto',
    fontFamily: 'var(--font, -apple-system, sans-serif)',
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    borderTopLeftRadius: 'var(--radius, 18px)', borderTopRightRadius: 'var(--radius, 18px)',
  },
  header: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  iconWrap: {
    flexShrink: 0, width: 40, height: 40, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  title: { margin: '3px 0 0', fontSize: 16.5, fontWeight: 600, color: 'var(--text, #f5f5f7)', lineHeight: 1.3 },
  closeBtn: {
    background: 'transparent', border: 'none', color: 'var(--text-muted, #86868b)',
    cursor: 'pointer', padding: 4, display: 'flex',
  },
  row: { display: 'flex', gap: 11, marginBottom: 14, alignItems: 'flex-start' },
  rowIcon: {
    flexShrink: 0, width: 26, height: 26, borderRadius: 8,
    background: 'var(--bg-input, #1c1c1e)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #86868b)',
  },
  rowLabel: {
    fontSize: 11, color: 'var(--text-dim, #6e6e73)', textTransform: 'uppercase',
    letterSpacing: '0.03em', marginBottom: 3,
  },
  rowText: { fontSize: 13.5, color: 'var(--text-muted, #c4c4c8)', lineHeight: 1.5 },
  pinCode: {
    fontFamily: 'var(--mono, monospace)', background: 'rgba(10,132,255,0.15)',
    color: '#5eb3ff', padding: '1px 6px', borderRadius: 4, fontSize: 12.5, margin: '0 2px',
  },
  learnBox: {
    background: 'rgba(10,132,255,0.07)', border: '1px solid rgba(10,132,255,0.22)',
    borderRadius: 12, padding: 14, margin: '4px 0 14px',
  },
  learnHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 },
  learnTitle: { fontSize: 12.5, fontWeight: 600, color: '#5eb3ff' },
  learnText: { margin: 0, fontSize: 13, color: 'var(--text-muted, #c4c4c8)', lineHeight: 1.5 },
  loadingBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    padding: '24px 0', color: 'var(--text-muted, #86868b)', fontSize: 13.5,
  },
  stepBar: { display: 'flex', alignItems: 'center', gap: 7, margin: '6px 0 12px' },
  stepDot: {
    width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: { marginLeft: 4, fontSize: 12, color: 'var(--text-dim, #8e8e93)', fontWeight: 500 },
  helpBox: {
    border: '1px solid rgba(10,132,255,0.25)', borderRadius: 12,
    padding: '12px 14px', marginBottom: 16,
  },
  btnRow: { display: 'flex', gap: 9 },
  btnGhost: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '11px 12px', borderRadius: 12, background: 'var(--bg-elevated, #2c2c2e)',
    color: 'var(--text, #f5f5f7)', border: 'none', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 500,
  },
  btnPrimary: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '11px 12px', borderRadius: 12, color: '#fff', border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  gotIt: {
    width: '100%', padding: 11, borderRadius: 12, color: '#fff',
    border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
};

export default IssueModal;

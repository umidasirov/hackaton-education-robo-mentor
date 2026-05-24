import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import {
  useCircuitIssuesStore,
  selectComponentIssues,
} from '../../store/useCircuitIssuesStore';
import type { CircuitIssue, IssueSeverity } from '../../store/useCircuitIssuesStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';

/**
 * Komponent ustidagi chaqmoq belgisi (Tinkercad uslubida).
 *
 *  - danger (faqat RUN): qizil portlash chaqmog'i, kuchli pulslaydi
 *  - error: qizg'ish chaqmoq
 *  - warning: sariq ogohlantirish
 *  - info: ko'k maslahat
 *
 * Portlash/zarar (danger) faqat simulyatsiya ISHGA TUSHIRILGANDA chiqadi.
 */

interface IssueBadgeProps {
  componentId: string;
  x: number;
  y: number;
}

const SEVERITY_RANK: Record<IssueSeverity, number> = {
  danger: 3,
  error: 2,
  warning: 1,
  info: 0,
};

const SEVERITY_STYLE: Record<IssueSeverity, { color: string; glow: string }> = {
  danger: { color: '#ff3b30', glow: '0 0 18px rgba(255,59,48,0.9)' },
  error: { color: '#ff453a', glow: '0 0 12px rgba(255,69,58,0.6)' },
  warning: { color: '#ffd60a', glow: '0 0 12px rgba(255,214,10,0.5)' },
  info: { color: '#0a84ff', glow: '0 0 10px rgba(10,132,255,0.5)' },
};

export const IssueBadge: React.FC<IssueBadgeProps> = ({ componentId, x, y }) => {
  const scanIssues = useCircuitIssuesStore((s) => s.scanIssues);
  const runIssues = useCircuitIssuesStore((s) => s.runIssues);
  const isRunning = useCircuitIssuesStore((s) => s.isRunning);
  const openIssue = useCircuitIssuesStore((s) => s.openIssue);
  const components = useSimulatorStore((s) => s.components);

  const componentType = React.useMemo(() => {
    const c = components.find((cc: any) => cc.id === componentId) as any;
    return c?.metadataId || c?.type || '';
  }, [components, componentId]);

  const issues = React.useMemo(
    () =>
      selectComponentIssues(
        componentId,
        scanIssues,
        runIssues,
        isRunning,
        componentType,
        components.length
      ),
    [componentId, scanIssues, runIssues, isRunning, componentType, components.length]
  );

  if (issues.length === 0) return null;

  // Eng jiddiy darajani aniqlash
  const top: CircuitIssue = issues.reduce((a, b) =>
    SEVERITY_RANK[b.severity] > SEVERITY_RANK[a.severity] ? b : a
  );
  const sev = top.severity;
  const { color, glow } = SEVERITY_STYLE[sev];
  const isDanger = sev === 'danger';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const issue =
          issues.find((i) => i.severity === 'danger') ||
          issues.find((i) => i.severity === 'error') ||
          issues[0];
        openIssue(issue);
      }}
      title={`${issues.length} ta muammo — ko'rish uchun bosing`}
    >
      <div
        style={{
          width: isDanger ? 30 : 26,
          height: isDanger ? 30 : 26,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1a1a1a',
          boxShadow: `0 0 0 3px rgba(0,0,0,0.4), ${glow}`,
          animation: isDanger
            ? 'issueDanger 0.7s ease-in-out infinite'
            : 'issuePulse 1.6s ease-in-out infinite',
        }}
      >
        {isDanger ? (
          <AlertTriangle size={16} fill="#1a1a1a" strokeWidth={0} />
        ) : (
          <Zap size={15} fill="#1a1a1a" strokeWidth={0} />
        )}
      </div>
      {issues.length > 1 && (
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            borderRadius: 8,
            background: '#1a1a1a',
            color,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1.5px solid ${color}`,
          }}
        >
          {issues.length}
        </span>
      )}
      <style>{`
        @keyframes issuePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        @keyframes issueDanger {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default IssueBadge;

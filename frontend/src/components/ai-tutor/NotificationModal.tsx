import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type NotificationType = 'error' | 'warning' | 'success' | 'info';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationModalProps {
  notification: NotificationData | null;
  onClose: () => void;
  /** Avtomatik yopilish vaqti (ms). 0 bo'lsa avtomatik yopilmaydi. */
  autoCloseMs?: number;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { color: string; bg: string; border: string; icon: React.ReactNode; defaultTitle: string }
> = {
  error: {
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.1)',
    border: 'rgba(248, 113, 113, 0.4)',
    icon: <AlertCircle size={22} />,
    defaultTitle: 'Xatolik',
  },
  warning: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.4)',
    icon: <AlertCircle size={22} />,
    defaultTitle: 'Ogohlantirish',
  },
  success: {
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.1)',
    border: 'rgba(52, 211, 153, 0.4)',
    icon: <CheckCircle size={22} />,
    defaultTitle: 'Muvaffaqiyatli',
  },
  info: {
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.4)',
    icon: <Info size={22} />,
    defaultTitle: "Ma'lumot",
  },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  autoCloseMs = 6000,
}) => {
  useEffect(() => {
    if (!notification) return;
    if (autoCloseMs > 0) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [notification, autoCloseMs, onClose]);

  if (!notification) return null;

  const cfg = TYPE_CONFIG[notification.type];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, borderColor: cfg.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ ...styles.iconWrap, background: cfg.bg, color: cfg.color }}>
          {cfg.icon}
        </div>
        <div style={styles.content}>
          <h3 style={{ ...styles.title, color: cfg.color }}>
            {notification.title || cfg.defaultTitle}
          </h3>
          <p style={styles.message}>{notification.message}</p>
        </div>
        <button style={styles.closeBtn} onClick={onClose} title="Yopish">
          <X size={18} />
        </button>
      </div>
      <style>{`@keyframes velxioFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.55)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '12vh',
    zIndex: 2000,
    animation: 'velxioFadeIn 0.15s ease',
  },
  modal: {
    position: 'relative',
    background: '#252526',
    border: '1px solid #3c3c3c',
    borderRadius: 10,
    padding: '20px 44px 20px 20px',
    width: 'min(440px, 90vw)',
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  },
  iconWrap: {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, minWidth: 0 },
  title: { margin: '0 0 6px', fontSize: 16, fontWeight: 600 },
  message: {
    margin: 0,
    color: '#cdcdcd',
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
};

export default NotificationModal;

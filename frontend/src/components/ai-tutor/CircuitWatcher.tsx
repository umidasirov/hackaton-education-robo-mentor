import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useEditorStore } from '../../store/useEditorStore';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useCircuitIssuesStore } from '../../store/useCircuitIssuesStore';

/**
 * CircuitWatcher — ko'rinmas (headless) fon kuzatuvchisi.
 *
 * Sxema (komponentlar + simlar) va kodni kuzatib turadi. O'zgarish bo'lsa,
 * biroz kutib (debounce) AI'dan avtomatik tekshiruv so'raydi va natijani
 * chaqmoq belgilari uchun store'ga yozadi (scanIssues).
 *
 * MUHIM QOIDALAR:
 *  - Simulyatsiya ISHLAB TURGANIDA (isRunning=true) scan QO'YILMAYDI.
 *    RUN paytida zarar tekshiruvi EditorToolbar'dagi runDamageCheck tomonidan
 *    bajariladi. Bu ikki paralel so'rovdan qochadi va UI ni tinch saqlaydi.
 *  - 'danger' severitysi scan orqali HECH QACHON chiqmaydi (store darajasida
 *    ham filtrlangan) — portlash faqat RUN + runIssues orqali ko'rinadi.
 */

const DEBOUNCE_MS = 2500;

export const CircuitWatcher: React.FC = () => {
  const { files, activeFileId } = useEditorStore();
  const { components, wires } = useSimulatorStore();
  const setScanIssues = useCircuitIssuesStore((s) => s.setScanIssues);
  const autoScanEnabled = useCircuitIssuesStore((s) => s.autoScanEnabled);
  const isRunning = useCircuitIssuesStore((s) => s.isRunning);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotRef = useRef<string>('');
  const availableRef = useRef<boolean | null>(null);

  // AI mavjudligini bir marta tekshirish
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get('/api/ai-tutor/status');
        if (!cancelled) availableRef.current = Boolean(res.data?.available);
      } catch {
        if (!cancelled) availableRef.current = false;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Simulyatsiya ishlayotganida scan QILMAYMIZ:
    // RUN paytida runDamageCheck ishlaydi, paralel scan keraksiz va UI ni buzadi.
    if (!autoScanEnabled || isRunning) return;

    const activeFile = files.find((f) => f.id === activeFileId);
    const payload = {
      code: activeFile?.content ?? '',
      components: components.map((c: any) => ({
        type: c.metadataId || c.type,
        id: c.id,
        properties: c.properties,
      })),
      connections: wires.map((w: any) => ({
        from: w.start.componentId,
        fromPin: w.start.pinName,
        to: w.end.componentId,
        toPin: w.end.pinName,
      })),
    };

    // Bo'sh loyiha - tekshirmaymiz
    if (!payload.code.trim() && payload.components.length === 0) return;

    // O'zgarish bo'lmasa - qayta so'ramaymiz
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastSnapshotRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // AI mavjud emasligi aniq bo'lsa - so'ramaymiz
      if (availableRef.current === false) return;
      lastSnapshotRef.current = snapshot;
      try {
        const res = await axios.post('/api/ai-tutor/check-circuit', {
          ...payload,
          mode: 'scan',
          // Loyiha kontekstini qo'shish — AI loyiha maqsadiga qarab tekshiradi
          ...(() => {
            try {
              const raw = localStorage.getItem('velxio-ai-project-context');
              if (raw) return { project_context: raw };
            } catch {}
            return {};
          })(),
        });
        if (res.data?.success && Array.isArray(res.data.issues)) {
          setScanIssues(res.data.issues);
        }
      } catch {
        // Jim - fon tekshiruvi xato bersa foydalanuvchiga ko'rsatmaymiz
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [files, activeFileId, components, wires, setScanIssues, autoScanEnabled, isRunning]);

  // Hech narsa render qilmaydi
  return null;
};

export default CircuitWatcher;

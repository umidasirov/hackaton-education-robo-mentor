import { create } from 'zustand';

/**
 * AI aniqlagan sxema muammolari uchun global holat.
 *
 * Ikki xil tekshiruv bor:
 *  - 'scan'  : AI panelda qo'lda/avtomatik tahlil. Maslahat va ogohlantirishlar.
 *  - 'run'   : RUN bosilganda fizik zarar tekshiruvi (portlash, kuyish, qisqa
 *              tutashuv). Faqat shu rejimda 'danger' darajasidagi chaqmoq chiqadi.
 *
 * SimulatorCanvas shu muammolarni o'qib, komponentlar ustiga chaqmoq belgisini
 * chiqaradi. RUN'dan kelgan 'danger' muammolari portlash animatsiyasi bilan.
 */

export type IssueSeverity = 'danger' | 'error' | 'warning' | 'info';
export type IssueKind = 'scan' | 'run';

export interface CircuitIssue {
  componentId: string;
  pin: string;
  /** danger = fizik zarar/portlash (faqat RUN), error/warning/info = maslahat (scan) */
  severity: IssueSeverity;
  message: string;
  /** Asosiy/tavsiya etilgan yechim */
  fix: string;
  /** Bir nechta yechim varianti (chiroyli ko'rsatish uchun) */
  options?: string[];
  /** Nega bu muammo yuzaga keladi - tushuntirish */
  why?: string;
  /** Bu muammo qaysi tekshiruvdan keldi */
  kind?: IssueKind;
}

interface CircuitIssuesState {
  /** Scan (AI panel) dan kelgan maslahat/ogohlantirishlar */
  scanIssues: CircuitIssue[];
  /** RUN bosilganda topilgan fizik zarar muammolari */
  runIssues: CircuitIssue[];
  /** Simulyatsiya hozir ishlayaptimi (chaqmoq ko'rinishini boshqaradi) */
  isRunning: boolean;

  /** Foydalanuvchi ko'rib chiqayotgan muammo (modal ochiq) */
  activeIssue: CircuitIssue | null;
  lastScanAt: number | null;
  lastRunCheckAt: number | null;
  /** Fon avtomatik tekshiruvi yoqilganmi (AI panel "Avto" tugmasi) */
  autoScanEnabled: boolean;

  setScanIssues: (issues: CircuitIssue[]) => void;
  setRunIssues: (issues: CircuitIssue[]) => void;
  clearRunIssues: () => void;
  clearAll: () => void;
  setIsRunning: (running: boolean) => void;
  setAutoScanEnabled: (enabled: boolean) => void;
  openIssue: (issue: CircuitIssue) => void;
  closeIssue: () => void;
}

export const useCircuitIssuesStore = create<CircuitIssuesState>((set) => ({
  scanIssues: [],
  runIssues: [],
  isRunning: false,
  activeIssue: null,
  autoScanEnabled: true,
  lastScanAt: null,
  lastRunCheckAt: null,

  setScanIssues: (issues) =>
    set({
      scanIssues: issues.map((i) => ({ ...i, kind: 'scan' as const })),
      lastScanAt: Date.now(),
    }),

  setRunIssues: (issues) =>
    set({
      runIssues: issues.map((i) => ({ ...i, kind: 'run' as const })),
      lastRunCheckAt: Date.now(),
    }),

  clearRunIssues: () => set({ runIssues: [] }),
  clearAll: () => set({ scanIssues: [], runIssues: [], activeIssue: null }),
  setIsRunning: (running) =>
    set(running ? { isRunning: true } : { isRunning: false, runIssues: [] }),
  setAutoScanEnabled: (enabled) => set({ autoScanEnabled: enabled }),
  openIssue: (issue) => set({ activeIssue: issue }),
  closeIssue: () => set({ activeIssue: null }),
}));

/**
 * Komponent uchun ko'rsatiladigan muammolarni hisoblaydi.
 *
 * Qoida:
 *  - 'danger' (portlash/zarar) — FAQAT RUN rejimida va FAQAT runIssues dan
 *    chiqadi. scanIssues da danger bo'lsa ham ko'rsatilmaydi.
 *  - Simulyatsiya ishlayotganda (RUN): fizik zarar (runIssues) + scan (warning/
 *    error/info) ko'rsatiladi.
 *  - Simulyatsiya to'xtaganda: faqat scan (warning/error/info) ko'rsatiladi.
 *    Portlash chaqmog'i RUN'siz HECH QACHON chiqmaydi.
 */
export function selectComponentIssues(
  componentId: string,
  scanIssues: CircuitIssue[],
  runIssues: CircuitIssue[],
  isRunning: boolean,
  componentType?: string,
  totalComponents?: number
): CircuitIssue[] {
  const all: CircuitIssue[] = [];

  // runIssues — faqat RUN paytida qo'shiladi (portlash/zarar shu yerdan keladi)
  if (isRunning) all.push(...runIssues);

  // scanIssues — 'danger' ni hech qachon scan dan ko'rsatmaymiz:
  // danger faqat fizik simulyatsiya (runDamageCheck) tomonidan aniqlanishi kerak.
  const safeScanIssues = scanIssues.filter((i) => i.severity !== 'danger');
  all.push(...safeScanIssues);

  if (all.length === 0) return [];

  // Moslashuvchan mos kelish: AI qaytargan componentId aniq mos kelmasligi
  // mumkin. Lekin haddan tashqari keng moslik (substring) noto'g'ri komponentlarga
  // ham badge chiqaradi — shuning uchun tartib bo'yicha qattiqroq tekshiramiz.
  const norm = (s: string) =>
    (s || '').toLowerCase().replace(/[\s\-_]/g, '');

  const cidNorm = norm(componentId);
  const typeNorm = norm(componentType || '');

  return all.filter((i) => {
    const issueId = norm(i.componentId);
    if (!issueId) return false;

    // 1) Aniq yoki normalizatsiyalangan id mos kelsa (eng ishonchli)
    if (issueId === cidNorm) return true;

    // 2) issueId raqam suffikssiz mos kelsa (led1 <-> led, resistor2 <-> resistor)
    //    Faqat bir tomon boshqa tomonni raqam-suffikssiz o'z ichiga olgan holda.
    const issueBase = issueId.replace(/\d+$/, '');
    const cidBase = cidNorm.replace(/\d+$/, '');
    if (issueBase && cidBase && issueBase === cidBase) return true;

    // 3) Komponent turi bo'yicha aniq mos kelsa (wokwi-led -> led)
    if (typeNorm && typeNorm.length > 2 && issueId === typeNorm) return true;

    // 4) Sxemada BITTA komponent bo'lganda — barcha muammolar o'shanga tegishli
    if (totalComponents === 1) return true;

    return false;
  });
}
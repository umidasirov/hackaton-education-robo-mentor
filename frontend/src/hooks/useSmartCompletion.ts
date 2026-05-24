import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSimulatorStore } from '../store/useSimulatorStore';

/**
 * Sxemaga qarab fikrlaydigan inline kod taklifi (smart autocomplete).
 *
 * Monaco editorga inline completion provider qo'shadi. Oddiy autocomplete'dan
 * farqi - canvas'dagi komponentlar va sim ulanishlarini (qaysi pin qayerga
 * ulangan) backendga yuboradi, AI esa shu sxemaga mos kod taklif qiladi.
 *
 * Masalan: LED 13-pinga ulangan bo'lsa, foydalanuvchi `pinMode(` deb yozsa,
 * AI `13, OUTPUT)` deb ghost-text (kulrang soya) ko'rsatadi. Tab bosilsa kiritiladi.
 */

interface UseSmartCompletionOptions {
  /** AI taklifi yoqilganmi (settings/toggle uchun) */
  enabled?: boolean;
  /** So'rovdan oldingi kechikish (ms) - bekorga so'rov yubormaslik uchun */
  debounceMs?: number;
}

// Monaco va editor instance tiplari any - paket tipi import qilmaslik uchun
export function registerSmartCompletion(
  monaco: any,
  editor: any,
  options: UseSmartCompletionOptions = {}
): () => void {
  const { enabled = true, debounceMs = 350 } = options;

  if (!enabled) return () => {};

  let lastRequestTime = 0;
  let inFlight: AbortController | null = null;

  const languages = ['cpp', 'c', 'python', 'plaintext'];
  const disposables: any[] = [];

  const provider = {
    // Monaco shu metodni kod yozilganda chaqiradi
    provideInlineCompletions: async (model: any, position: any) => {
      try {
        const offset = model.getOffsetAt(position);
        const fullText: string = model.getValue();
        const codeBefore = fullText.slice(0, offset);
        const codeAfter = fullText.slice(offset);

        // Juda qisqa bo'lsa yoki qator oxirida bo'sh joy bo'lsa - tashlab ketamiz
        if (codeBefore.trim().length < 3) {
          return { items: [] };
        }

        // Debounce: tez-tez yozilganda oxirgisidan keyin so'raymiz
        const now = Date.now();
        lastRequestTime = now;
        await new Promise((r) => setTimeout(r, debounceMs));
        if (lastRequestTime !== now) {
          return { items: [] }; // yangiroq so'rov keldi
        }

        // Oldingi so'rovni bekor qilish
        if (inFlight) inFlight.abort();
        inFlight = new AbortController();

        // Sxema kontekstini store'dan olish (real vaqtda)
        const { components, wires } = useSimulatorStore.getState();
        const language = model.getLanguageId?.() || 'cpp';

        const res = await axios.post(
          '/api/ai-tutor/code-suggest',
          {
            code_before: codeBefore,
            code_after: codeAfter,
            language,
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
          },
          { signal: inFlight.signal }
        );

        const suggestion: string = res.data?.suggestion || '';
        if (!suggestion.trim()) {
          return { items: [] };
        }

        return {
          items: [
            {
              insertText: suggestion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
            },
          ],
        };
      } catch (err: any) {
        // Bekor qilingan yoki tarmoq xatosi - jim, autocomplete buzilmasin
        return { items: [] };
      }
    },
    freeInlineCompletions: () => {},
  };

  // Har bir til uchun ro'yxatdan o'tkazish
  for (const lang of languages) {
    disposables.push(
      monaco.languages.registerInlineCompletionsProvider(lang, provider)
    );
  }

  // Tozalash funksiyasi
  return () => {
    if (inFlight) inFlight.abort();
    disposables.forEach((d) => d?.dispose?.());
  };
}

/**
 * React hook ko'rinishi - agar editor ref orqali boshqarilsa.
 * (Hozircha CodeEditor onMount ichida registerSmartCompletion ishlatiladi.)
 */
export function useSmartCompletionLifecycle(
  monacoRef: React.MutableRefObject<any>,
  editorRef: React.MutableRefObject<any>,
  options: UseSmartCompletionOptions = {}
) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      cleanupRef.current = registerSmartCompletion(
        monacoRef.current,
        editorRef.current,
        options
      );
    }
    return () => {
      cleanupRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoRef.current, editorRef.current, options.enabled]);
}

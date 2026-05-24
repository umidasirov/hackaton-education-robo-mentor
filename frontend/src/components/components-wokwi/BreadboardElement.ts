/**
 * Breadboard Web Component
 *
 * Half-size solderless breadboard (400 tie points).
 * - 30 columns (1–30)
 * - Rows a–e (top block) and f–j (bottom block)
 * - Top power rail (+/–) and bottom power rail (+/–)
 * - pinInfo exposes every hole so wires can connect
 */

// ─── Dimensions ───────────────────────────────────────────────────────────────
const COLS = 30;
const COL_START_X = 38;   // x of column 1 centre
const COL_STEP    = 13;   // 2.54 mm → ~10 px, slightly stretched for clarity

const ROW_A = 46;
const ROW_B = 59;
const ROW_C = 72;
const ROW_D = 85;
const ROW_E = 98;

const ROW_F = 122;
const ROW_G = 135;
const ROW_H = 148;
const ROW_I = 161;
const ROW_J = 174;

const TOP_PLUS  = 14;   // top power rail  +
const TOP_MINUS = 27;   // top power rail  −
const BOT_PLUS  = 198;  // bottom power rail +
const BOT_MINUS = 211;  // bottom power rail −

const W = COL_START_X + (COLS - 1) * COL_STEP + 32;  // ~430
const H = BOT_MINUS + 18;                              // ~229

// ─── Pin list ─────────────────────────────────────────────────────────────────
function colX(col: number): number {
  return COL_START_X + (col - 1) * COL_STEP;
}

function makePins() {
  const pins: { name: string; x: number; y: number }[] = [];

  for (let c = 1; c <= COLS; c++) {
    const x = colX(c);

    // Top power rail
    pins.push({ name: `tp${c}+`, x, y: TOP_PLUS  });
    pins.push({ name: `tp${c}-`, x, y: TOP_MINUS });

    // Main rows a–e  (top block)
    pins.push({ name: `${c}a`, x, y: ROW_A });
    pins.push({ name: `${c}b`, x, y: ROW_B });
    pins.push({ name: `${c}c`, x, y: ROW_C });
    pins.push({ name: `${c}d`, x, y: ROW_D });
    pins.push({ name: `${c}e`, x, y: ROW_E });

    // Main rows f–j  (bottom block)
    pins.push({ name: `${c}f`, x, y: ROW_F });
    pins.push({ name: `${c}g`, x, y: ROW_G });
    pins.push({ name: `${c}h`, x, y: ROW_H });
    pins.push({ name: `${c}i`, x, y: ROW_I });
    pins.push({ name: `${c}j`, x, y: ROW_J });

    // Bottom power rail
    pins.push({ name: `bp${c}+`, x, y: BOT_PLUS  });
    pins.push({ name: `bp${c}-`, x, y: BOT_MINUS });
  }

  return pins;
}

const PINS = makePins();

// ─── SVG renderer ─────────────────────────────────────────────────────────────
function buildSVG(): string {
  const holes: string[] = [];

  const dot = (x: number, y: number, color = '#2a2a2a') =>
    `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" rx="1.5" fill="${color}"/>`;

  for (let c = 1; c <= COLS; c++) {
    const x = colX(c);

    // Power rail holes
    holes.push(dot(x, TOP_PLUS,  '#c0392b'));
    holes.push(dot(x, TOP_MINUS, '#2980b9'));
    holes.push(dot(x, BOT_PLUS,  '#c0392b'));
    holes.push(dot(x, BOT_MINUS, '#2980b9'));

    // Main rows
    for (const y of [ROW_A, ROW_B, ROW_C, ROW_D, ROW_E, ROW_F, ROW_G, ROW_H, ROW_I, ROW_J]) {
      holes.push(dot(x, y));
    }
  }

  // Column numbers every 5
  const colLabels: string[] = [];
  for (let c = 1; c <= COLS; c += 5) {
    const x = colX(c);
    colLabels.push(`<text x="${x}" y="${ROW_A - 12}" text-anchor="middle" font-size="7" fill="#666" font-family="monospace">${c}</text>`);
    colLabels.push(`<text x="${x}" y="${ROW_J + 17}" text-anchor="middle" font-size="7" fill="#666" font-family="monospace">${c}</text>`);
  }

  // Row labels
  const rowLabels = [
    ['a', ROW_A], ['b', ROW_B], ['c', ROW_C], ['d', ROW_D], ['e', ROW_E],
    ['f', ROW_F], ['g', ROW_G], ['h', ROW_H], ['i', ROW_I], ['j', ROW_J],
  ].map(([l, y]) =>
    `<text x="12" y="${(y as number) + 3}" text-anchor="middle" font-size="8" fill="#555" font-family="monospace">${l}</text>` +
    `<text x="${W - 12}" y="${(y as number) + 3}" text-anchor="middle" font-size="8" fill="#555" font-family="monospace">${l}</text>`
  );

  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <rect width="${W}" height="${H}" rx="6" fill="#d4c9a8"/>

  <!-- Top power rail background -->
  <rect x="4" y="${TOP_PLUS - 8}" width="${W - 8}" height="30" rx="3" fill="#b8b0a0"/>
  <!-- Red stripe + -->
  <line x1="24" y1="${TOP_PLUS}" x2="${W - 24}" y2="${TOP_PLUS}" stroke="#e74c3c" stroke-width="2" opacity="0.5"/>
  <!-- Blue stripe − -->
  <line x1="24" y1="${TOP_MINUS}" x2="${W - 24}" y2="${TOP_MINUS}" stroke="#3498db" stroke-width="2" opacity="0.5"/>
  <text x="16" y="${TOP_PLUS + 3}" font-size="8" fill="#e74c3c" font-family="monospace" font-weight="bold">+</text>
  <text x="16" y="${TOP_MINUS + 3}" font-size="8" fill="#3498db" font-family="monospace" font-weight="bold">−</text>

  <!-- Top block background -->
  <rect x="24" y="${ROW_A - 9}" width="${W - 48}" height="${ROW_E - ROW_A + 18}" rx="2" fill="#c8be9e"/>

  <!-- Center divider -->
  <rect x="4" y="${ROW_E + 10}" width="${W - 8}" height="${ROW_F - ROW_E - 20}" rx="2" fill="#b0a88a"/>
  <text x="${W / 2}" y="${(ROW_E + ROW_F) / 2 + 4}" text-anchor="middle" font-size="7" fill="#8a7a60" font-family="monospace">- - - - - - - - - - - - - - -</text>

  <!-- Bottom block background -->
  <rect x="24" y="${ROW_F - 9}" width="${W - 48}" height="${ROW_J - ROW_F + 18}" rx="2" fill="#c8be9e"/>

  <!-- Bottom power rail background -->
  <rect x="4" y="${BOT_PLUS - 8}" width="${W - 8}" height="30" rx="3" fill="#b8b0a0"/>
  <!-- Red stripe + -->
  <line x1="24" y1="${BOT_PLUS}" x2="${W - 24}" y2="${BOT_PLUS}" stroke="#e74c3c" stroke-width="2" opacity="0.5"/>
  <!-- Blue stripe − -->
  <line x1="24" y1="${BOT_MINUS}" x2="${W - 24}" y2="${BOT_MINUS}" stroke="#3498db" stroke-width="2" opacity="0.5"/>
  <text x="16" y="${BOT_PLUS + 3}" font-size="8" fill="#e74c3c" font-family="monospace" font-weight="bold">+</text>
  <text x="16" y="${BOT_MINUS + 3}" font-size="8" fill="#3498db" font-family="monospace" font-weight="bold">−</text>

  <!-- Row labels -->
  ${rowLabels.join('\n  ')}

  <!-- Column labels -->
  ${colLabels.join('\n  ')}

  <!-- Holes -->
  ${holes.join('\n  ')}
</svg>`.trim();
}

// ─── Custom element ───────────────────────────────────────────────────────────
class BreadboardElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get pinInfo() {
    return PINS;
  }

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; line-height: 0; }
        svg   { display: block; }
      </style>
      ${buildSVG()}
    `;
  }
}

if (!customElements.get('wokwi-breadboard')) {
  customElements.define('wokwi-breadboard', BreadboardElement);
}

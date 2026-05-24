/**
 * 9V (PP3) battery — visual model similar to Tinkercad / real PP3 layout:
 * plastic shell, two snap terminals on top, label face with voltage text.
 */
class Battery9VElement extends HTMLElement {
  readonly pinInfo = [
    {
      name: 'VCC',
      x: 24,
      y: 11,
      number: 1,
      signals: [{ type: 'power', signal: 'VCC' }],
    },
    {
      name: 'GND',
      x: 48,
      y: 11,
      number: 2,
      signals: [{ type: 'power', signal: 'GND' }],
    },
  ];

  static get observedAttributes() {
    return ['voltage', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const voltage = this.getAttribute('voltage') || '9V';
    const label = this.getAttribute('label') || 'Battery';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          line-height: 0;
          user-select: none;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
        }
        svg { display: block; overflow: visible; }
      </style>
      <svg width="72" height="128" viewBox="0 0 72 128" xmlns="http://www.w3.org/2000/svg" aria-label="9V battery">
        <defs>
          <linearGradient id="shell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3a3a3a"/>
            <stop offset="45%" style="stop-color:#252525"/>
            <stop offset="100%" style="stop-color:#1a1a1a"/>
          </linearGradient>
          <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#e8d89a"/>
            <stop offset="40%" style="stop-color:#b8963a"/>
            <stop offset="100%" style="stop-color:#8a7028"/>
          </linearGradient>
          <linearGradient id="labelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f2ead4"/>
            <stop offset="100%" style="stop-color:#dcd0b0"/>
          </linearGradient>
        </defs>

        <!-- Main plastic body (PP3 brick) -->
        <path d="M14 28 L58 28 Q64 28 64 34 L64 112 Q64 118 58 118 L14 118 Q8 118 8 112 L8 34 Q8 28 14 28 Z"
              fill="url(#shell)" stroke="#0d0d0d" stroke-width="1.2"/>

        <!-- Bevel highlight -->
        <path d="M16 32 L56 32 Q60 32 60 36 L60 108 Q60 112 56 112 L16 112 Q12 112 12 108 L12 36 Q12 32 16 32 Z"
              fill="none" stroke="#555" stroke-width="0.6" opacity="0.5"/>

        <!-- Front label (cream) -->
        <rect x="16" y="44" width="40" height="52" rx="4" fill="url(#labelGrad)" stroke="#c4b896" stroke-width="0.8"/>
        <text x="36" y="72" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="22" font-weight="800" fill="#c62828">${voltage}</text>
        <text x="36" y="90" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="9" font-weight="600" fill="#4a4a4a">${label}</text>

        <!-- Snap posts (metal) -->
        <g>
          <!-- Positive (smaller circle, left) -->
          <circle cx="24" cy="11" r="9" fill="url(#metal)" stroke="#5c4a1e" stroke-width="1"/>
          <circle cx="24" cy="11" r="4" fill="#6d5a28" opacity="0.35"/>
          <text x="24" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="#8b1a1a">+</text>
          <!-- Negative (hex-style, right) -->
          <circle cx="48" cy="11" r="9" fill="url(#metal)" stroke="#5c4a1e" stroke-width="1"/>
          <path d="M48 6 L52 11 L48 16 L44 11 Z" fill="#3d3d3d" opacity="0.5"/>
          <text x="48" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="#222">−</text>
        </g>

        <!-- Connector neck -->
        <rect x="20" y="20" width="32" height="12" rx="2" fill="#2a2a2a" stroke="#111"/>
      </svg>
    `;
  }
}

if (!customElements.get('wokwi-battery-9v')) {
  customElements.define('wokwi-battery-9v', Battery9VElement);
}

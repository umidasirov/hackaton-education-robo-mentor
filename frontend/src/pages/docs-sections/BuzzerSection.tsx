import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../../components/layout/CodeBlock';
import { loadExample } from '../../utils/loadExample';
import { docsExamples } from '../../data/docs-examples';
const SimBtn: React.FC<{ k: string; label?: string }> = ({ k, label = '🚀 Simulyatorda ko\'rish' }) => { const nav = useNavigate(); const [ld, setLd] = React.useState(false); if (!docsExamples[k]) return null; return (<button onClick={async () => { setLd(true); try { await loadExample(docsExamples[k]); nav('/editor'); } catch { setLd(false); } }} disabled={ld} className="docs-sim-btn">{ld ? 'Yuklanmoqda...' : label}</button>); };

export const BuzzerSection: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// buzzer</span>
    <h1>🔊 Buzzer (Tovush chiqaruvchi)</h1>

    <h2>Bu nima?</h2>
    <p>Buzzer — elektr signalini <strong>ovozga aylantiradigan</strong> qurilma. Ichida piezoelektrik plastinka bor. Ikki turi mavjud:</p>
    <ul>
      <li><strong>Aktiv buzzer</strong> — tok bersangiz o'zi signal chiqaradi (faqat HIGH/LOW). Oddiy "bip" ovozi.</li>
      <li><strong>Passiv buzzer</strong> — chastotani siz berasiz (<code>tone()</code> funksiyasi bilan). Turli notalar va melodiyalar chalish mumkin.</li>
    </ul>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Buzzer.jpg/220px-Buzzer.jpg" alt="Buzzer" style={{ maxWidth: 200, margin: '16px 0', borderRadius: 8 }} />

    <h2>Nota chastotalari</h2>
    <table>
      <thead><tr><th>Nota</th><th>Chastota (Hz)</th></tr></thead>
      <tbody>
        <tr><td>Do (C4)</td><td>262</td></tr>
        <tr><td>Re (D4)</td><td>294</td></tr>
        <tr><td>Mi (E4)</td><td>330</td></tr>
        <tr><td>Fa (F4)</td><td>349</td></tr>
        <tr><td>Sol (G4)</td><td>392</td></tr>
        <tr><td>La (A4)</td><td>440</td></tr>
        <tr><td>Si (B4)</td><td>494</td></tr>
      </tbody>
    </table>

    <h2>Kod</h2>
    <CodeBlock language="cpp">{`#define BUZZER 8

void setup() {}

void loop() {
  tone(BUZZER, 262, 400); delay(500); // Do
  tone(BUZZER, 294, 400); delay(500); // Re
  tone(BUZZER, 330, 400); delay(500); // Mi
  tone(BUZZER, 349, 400); delay(500); // Fa
  tone(BUZZER, 392, 800); delay(900); // Sol
  noTone(BUZZER);
  delay(2000);
}`}</CodeBlock>
    <SimBtn k="buzzer-melody" label="🚀 Buzzer melodiya simulyatsiyasi" />

    <h2>📹 Video</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=Ks_6A3PnEPo" target="_blank" rel="noopener noreferrer">Arduino Buzzer — melodiya chalish</a></li>
    </ul>
  </div>
);

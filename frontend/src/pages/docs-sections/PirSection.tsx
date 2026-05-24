import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../../components/layout/CodeBlock';
import { loadExample } from '../../utils/loadExample';
import { docsExamples } from '../../data/docs-examples';
const SimBtn: React.FC<{ k: string; label?: string }> = ({ k, label = '🚀 Simulyatorda ko\'rish' }) => { const nav = useNavigate(); const [ld, setLd] = React.useState(false); if (!docsExamples[k]) return null; return (<button onClick={async () => { setLd(true); try { await loadExample(docsExamples[k]); nav('/editor'); } catch { setLd(false); } }} disabled={ld} className="docs-sim-btn">{ld ? 'Yuklanmoqda...' : label}</button>); };

export const PirSection: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// harakat sensori</span>
    <h1>👁️ PIR — Harakat sensori (HC-SR501)</h1>

    <h2>Bu nima?</h2>
    <p>PIR (Passive InfraRed) — <strong>inson va hayvonlarning infraqizil nurlanishini</strong> aniqlaydi. O'zi hech narsa chiqarmaydi (passiv), faqat harorat o'zgarishini kuzatadi. Harakat bo'lganda HIGH signal beradi.</p>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/PIR_sensor.jpg/220px-PIR_sensor.jpg" alt="PIR sensor" style={{ maxWidth: 220, margin: '16px 0', borderRadius: 8 }} />

    <h2>Ishlash prinsipi</h2>
    <p>PIR sensori ichida <strong>piroelektrik element</strong> bor. Inson (37°C) xonada harakatlanganida, sensor old tomonidagi <strong>Fresnel linzasi</strong> infraqizil nurni elementga yo'naltiradi. Element harorat o'zgarishini elektr signalga aylantiradi.</p>
    <ul>
      <li><strong>Deteksiya masofa:</strong> 3-7 m (sozlanadi)</li>
      <li><strong>Burchak:</strong> ~110°</li>
      <li><strong>Quvvat:</strong> 5-12V DC</li>
      <li>Ikkita potensiometr: <strong>sezgirlik</strong> va <strong>vaqt</strong> (0.3s - 5 daqiqa)</li>
    </ul>

    <h2>Ulanish</h2>
    <table>
      <thead><tr><th>HC-SR501</th><th>Arduino</th></tr></thead>
      <tbody>
        <tr><td>VCC</td><td>5V</td></tr>
        <tr><td>OUT</td><td>Pin 2</td></tr>
        <tr><td>GND</td><td>GND</td></tr>
      </tbody>
    </table>

    <h2>Kod</h2>
    <CodeBlock language="cpp">{`#define PIR_PIN 2
#define LED_PIN 13

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  delay(2000); // PIR stabilizatsiya vaqti
}

void loop() {
  if(digitalRead(PIR_PIN) == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("🚶 Harakat aniqlandi!");
    delay(2000);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`}</CodeBlock>
    <SimBtn k="pir-motion" label="🚀 PIR + LED simulyatsiyasini ochish" />

    <h2>Qayerda ishlatiladi?</h2>
    <ul>
      <li>🔐 <strong>Xavfsizlik signalizatsiyasi</strong></li>
      <li>💡 <strong>Avtomatik yoritish</strong> — odam kirsa yonadi</li>
      <li>📊 <strong>Odam hisoblash</strong> — ziyoratchilar soni</li>
      <li>🏠 <strong>Smart home</strong> — energiya tejash</li>
    </ul>

    <h2>📹 Video</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=6Fdrr_1guok" target="_blank" rel="noopener noreferrer">PIR sensor qanday ishlaydi — animatsiya</a></li>
    </ul>
  </div>
);

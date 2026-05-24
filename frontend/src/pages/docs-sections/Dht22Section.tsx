import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../../components/layout/CodeBlock';
import { loadExample } from '../../utils/loadExample';
import { docsExamples } from '../../data/docs-examples';
const SimBtn: React.FC<{ k: string; label?: string }> = ({ k, label = '🚀 Simulyatorda ko\'rish' }) => { const nav = useNavigate(); const [ld, setLd] = React.useState(false); if (!docsExamples[k]) return null; return (<button onClick={async () => { setLd(true); try { await loadExample(docsExamples[k]); nav('/editor'); } catch { setLd(false); } }} disabled={ld} className="docs-sim-btn">{ld ? 'Yuklanmoqda...' : label}</button>); };

export const Dht22Section: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// harorat va namlik</span>
    <h1>🌡️ DHT22 — Harorat va namlik sensori</h1>

    <h2>Bu nima?</h2>
    <p>DHT22 (AM2302) — havoning <strong>harorati</strong> va <strong>nisbiy namligini</strong> bir vaqtda o'lchay oladigan raqamli datchik. Ob-havo stansiyasi, issiqxona nazorati va smart home loyihalarida keng qo'llaniladi.</p>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/DHT22.jpg/220px-DHT22.jpg" alt="DHT22" style={{ maxWidth: 220, margin: '16px 0', borderRadius: 8 }} />

    <h2>Ishlash prinsipi</h2>
    <p>Ichida ikkita sensor bor: <strong>kapasitiv namlik sensori</strong> (havoning namligi o'zgarganda sig'im o'zgaradi) va <strong>NTC termistor</strong> (haroratga qarab qarshilik o'zgaradi). Natijani <strong>bitta raqamli pin</strong> orqali 40 bit formatida uzatadi.</p>

    <h2>Texnik xususiyatlar</h2>
    <table>
      <thead><tr><th>Parametr</th><th>DHT22</th><th>DHT11</th></tr></thead>
      <tbody>
        <tr><td>Harorat diapazoni</td><td>-40°C ~ +80°C</td><td>0°C ~ 50°C</td></tr>
        <tr><td>Harorat aniqligi</td><td>±0.5°C</td><td>±2°C</td></tr>
        <tr><td>Namlik diapazoni</td><td>0 — 100%</td><td>20 — 80%</td></tr>
        <tr><td>Namlik aniqligi</td><td>±2%</td><td>±5%</td></tr>
        <tr><td>O'qish tezligi</td><td>Har 2 soniyada</td><td>Har 1 soniyada</td></tr>
        <tr><td>Narxi</td><td>~$3</td><td>~$1</td></tr>
      </tbody>
    </table>

    <h2>Ulanish</h2>
    <table>
      <thead><tr><th>DHT22</th><th>Arduino</th></tr></thead>
      <tbody>
        <tr><td>VCC</td><td>5V (3.3V ham ishlaydi)</td></tr>
        <tr><td>DATA</td><td>Pin 2 (10kΩ pull-up rezistor bilan)</td></tr>
        <tr><td>GND</td><td>GND</td></tr>
      </tbody>
    </table>

    <h2>Kod</h2>
    <CodeBlock language="cpp">{`#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if(isnan(h) || isnan(t)) {
    Serial.println("Xato: DHT o'qilmayapti!");
    return;
  }
  Serial.print("Harorat: "); Serial.print(t); Serial.print("°C  ");
  Serial.print("Namlik: "); Serial.print(h); Serial.println("%");
}`}</CodeBlock>
    <SimBtn k="dht22-temp" label="🚀 DHT22 simulyatsiyasini ochish" />

    <h2>Qayerda ishlatiladi?</h2>
    <ul>
      <li>🌤️ <strong>Ob-havo stansiyasi</strong></li>
      <li>🌿 <strong>Issiqxona / fermer</strong> — harorat va namlikni nazorat</li>
      <li>🖥️ <strong>Server xonasi</strong> — ortiqcha qizishdan ogohlantirish</li>
      <li>🏠 <strong>Smart home</strong> — konditsioner avtomatikasi</li>
    </ul>

    <h2>📹 Video</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=OogldLc9uYc" target="_blank" rel="noopener noreferrer">DHT22 bilan ishlash — to'liq qo'llanma</a></li>
    </ul>
  </div>
);

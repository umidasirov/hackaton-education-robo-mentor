import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../../components/layout/CodeBlock';
import { loadExample } from '../../utils/loadExample';
import { docsExamples } from '../../data/docs-examples';

const SimBtn: React.FC<{ k: string; label?: string }> = ({ k, label = '🚀 Simulyatorda ko\'rish' }) => {
  const nav = useNavigate();
  const [ld, setLd] = React.useState(false);
  if (!docsExamples[k]) return null;
  return (
    <button onClick={async () => { setLd(true); try { await loadExample(docsExamples[k]); nav('/editor'); } catch { setLd(false); } }}
      disabled={ld} className="docs-sim-btn">{ld ? 'Yuklanmoqda...' : label}</button>
  );
};

export const ServoSection: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// servo motor</span>
    <h1>⚙️ Servo motor</h1>

    <h2>Bu nima?</h2>
    <p>
      Servo motor — <strong>aniq burchakka</strong> aylanadigan maxsus motor. Oddiy DC motordan farqi —
      siz "90 gradusga buril" desangiz, aniq 90 gradusga buriladi va o'sha joyda turadi.
      Ichida motor + tishli uzatma + potensiometr (pozitsiya sensori) bor.
    </p>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Servomotor.jpg/300px-Servomotor.jpg"
      alt="Servo motor" style={{ maxWidth: 280, margin: '16px 0', borderRadius: 8 }} />

    <h2>Ishlash prinsipi</h2>
    <p>
      Servo <strong>PWM (Pulse Width Modulation)</strong> signali bilan boshqariladi. Har 20ms da
      (50 Hz chastota) bir impuls keladi. Impulsning kengligi burchakni belgilaydi:
    </p>
    <ul>
      <li><strong>1ms impuls</strong> → 0° (to'liq chapga)</li>
      <li><strong>1.5ms impuls</strong> → 90° (o'rtaga)</li>
      <li><strong>2ms impuls</strong> → 180° (to'liq o'ngga)</li>
    </ul>
    <img src="https://howtomechatronics.com/wp-content/uploads/2022/04/Servo-Motor-Working-Principle-PWM-Signal.png"
      alt="Servo PWM signali" style={{ maxWidth: 450, margin: '16px 0', borderRadius: 8 }} />

    <h2>Texnik xususiyatlar</h2>
    <table>
      <thead><tr><th>Model</th><th>Moment</th><th>Tezlik</th><th>Og'irlik</th><th>Ishlatish</th></tr></thead>
      <tbody>
        <tr><td>SG90</td><td>1.8 kg·cm</td><td>0.1s / 60°</td><td>9g</td><td>Yengil loyihalar, robotlar</td></tr>
        <tr><td>MG90S</td><td>2.2 kg·cm</td><td>0.1s / 60°</td><td>13.4g</td><td>Metall tishli, mustahkamroq</td></tr>
        <tr><td>MG995</td><td>11 kg·cm</td><td>0.2s / 60°</td><td>55g</td><td>Robot qo'li, kamera</td></tr>
        <tr><td>MG996R</td><td>13 kg·cm</td><td>0.17s / 60°</td><td>55g</td><td>Og'ir yuklama</td></tr>
      </tbody>
    </table>

    <h2>Arduino ga ulash</h2>
    <table>
      <thead><tr><th>Servo sim</th><th>Arduino</th><th>Rang</th></tr></thead>
      <tbody>
        <tr><td>VCC (qizil)</td><td>5V</td><td>🔴 Qizil</td></tr>
        <tr><td>GND (qo'ng'ir/qora)</td><td>GND</td><td>⚫ Qora</td></tr>
        <tr><td>Signal (sariq/oq)</td><td>Pin 9 (PWM)</td><td>🟡 Sariq</td></tr>
      </tbody>
    </table>

    <h2>Kod</h2>
    <CodeBlock language="cpp">{`#include <Servo.h>
Servo myservo;

void setup() {
  myservo.attach(9);  // 9-pinga ulash
  Serial.begin(9600);
}

void loop() {
  // 0 dan 180 gacha sekin aylantirish
  for(int angle = 0; angle <= 180; angle += 10) {
    myservo.write(angle);
    Serial.print("Burchak: ");
    Serial.println(angle);
    delay(200);
  }
  // 180 dan 0 ga qaytish
  for(int angle = 180; angle >= 0; angle -= 10) {
    myservo.write(angle);
    delay(200);
  }
}`}</CodeBlock>

    <SimBtn k="servo-motor" label="🚀 Servo loyihasini simulyatorda ochish" />

    <h2>Qayerda ishlatiladi?</h2>
    <ul>
      <li>🦾 <strong>Robot qo'li</strong> — har bo'g'inga bitta servo</li>
      <li>📷 <strong>Kamera platformasi</strong> — pan/tilt harakati</li>
      <li>🔒 <strong>Aqlli qulf</strong> — eshikni ochish/yopish</li>
      <li>🤖 <strong>Robot boshi</strong> — ultrasonik sensorni aylantirish</li>
      <li>✈️ <strong>Dron / samolyot</strong> — qanotchalarni boshqarish</li>
    </ul>

    <h2>⚠️ Muhim eslatmalar</h2>
    <ul>
      <li>❌ <strong>2+ servo Arduino 5V dan olmang</strong> — tok yetmaydi. Alohida 5V adapter ishlating</li>
      <li>❌ <strong>Servoni qo'l bilan aylantirmang</strong> — tishli uzatma sinishi mumkin</li>
      <li>✅ GND larni bir-biriga ulang (Arduino GND va adapter GND)</li>
    </ul>

    <h2>📹 Video</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=kUHmYKWwuWs" target="_blank" rel="noopener noreferrer">Servo motor qanday ishlaydi — animatsion tushuntirish</a></li>
      <li><a href="https://www.youtube.com/watch?v=LXURLvga8bQ" target="_blank" rel="noopener noreferrer">Arduino Servo boshqarish — amaliy darslik</a></li>
    </ul>
  </div>
);

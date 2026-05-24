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

export const UltrasonicSection: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// ultrasonik sensor</span>
    <h1>📡 HC-SR04 — Ultrasonik masofa sensori</h1>

    <h2>Bu nima?</h2>
    <p>
      HC-SR04 — eng mashhur va arzon ultrasonik masofa o'lchash moduli. U <strong>ko'zga ko'rinmas
      ultrasonik to'lqinlar</strong> (40 kHz) yordamida oldidagi to'siqgacha bo'lgan masofani o'lchaydi.
      Ko'z bilan ko'rish mumkin bo'lmagan joylarni ham "ko'radi".
    </p>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/HC-SR04_Ultrasonic_Sensor.jpg/320px-HC-SR04_Ultrasonic_Sensor.jpg"
      alt="HC-SR04 ultrasonik sensor" style={{ maxWidth: 300, margin: '16px 0', borderRadius: 8 }} />

    <h2>Ishlash prinsipi</h2>
    <p>
      Sensor ikkita "ko'z" ga ega: biri <strong>T (Transmitter)</strong> — ultrasonik to'lqin chiqaradi,
      ikkinchisi <strong>R (Receiver)</strong> — qaytgan to'lqinni qabul qiladi.
    </p>
    <ol>
      <li>Arduino <strong>Trig</strong> piniga 10μs (mikrosekund) impuls yuboradi</li>
      <li>Sensor 8 ta 40 kHz ultrasonik to'lqin chiqaradi</li>
      <li>To'lqin to'siqdan <strong>qaytadi</strong> (aks sado prinsipi)</li>
      <li><strong>Echo</strong> pini to'lqin qaytguncha HIGH bo'ladi</li>
      <li>Vaqtni o'lchab, masofani hisoblaymiz: <code>masofa = vaqt × 0.034 / 2</code></li>
    </ol>
    <img src="https://howtomechatronics.com/wp-content/uploads/2015/07/Ultrasonic-Sensor-Diagram.png"
      alt="HC-SR04 ishlash prinsipi" style={{ maxWidth: 500, margin: '16px 0', borderRadius: 8 }} />

    <h2>Texnik xususiyatlari</h2>
    <table>
      <thead><tr><th>Parametr</th><th>Qiymat</th></tr></thead>
      <tbody>
        <tr><td>Quvvat</td><td>5V DC</td></tr>
        <tr><td>Masofa diapazoni</td><td>2 sm — 400 sm</td></tr>
        <tr><td>Aniqlik</td><td>±3 mm</td></tr>
        <tr><td>O'lchash burchagi</td><td>~15°</td></tr>
        <tr><td>Ishchi chastota</td><td>40 kHz</td></tr>
        <tr><td>Trigger impuls</td><td>10 μs TTL</td></tr>
        <tr><td>Echo impuls</td><td>100μs — 25ms (masofaga proporsional)</td></tr>
      </tbody>
    </table>

    <h2>Arduino ga ulash</h2>
    <table>
      <thead><tr><th>HC-SR04</th><th>Arduino Uno</th><th>Sim rangi</th></tr></thead>
      <tbody>
        <tr><td>VCC</td><td>5V</td><td>🔴 Qizil</td></tr>
        <tr><td>GND</td><td>GND</td><td>⚫ Qora</td></tr>
        <tr><td>Trig</td><td>Pin 9</td><td>🟢 Yashil</td></tr>
        <tr><td>Echo</td><td>Pin 10</td><td>🔵 Ko'k</td></tr>
      </tbody>
    </table>

    <h2>Kod</h2>
    <CodeBlock language="cpp">{`// HC-SR04 Ultrasonik masofa sensori
#define TRIG_PIN 9
#define ECHO_PIN 10

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 tayyor!");
}

void loop() {
  // 1. Trigger impuls (10 mikrosekund)
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 2. Echo vaqtini o'lchash
  long duration = pulseIn(ECHO_PIN, HIGH);

  // 3. Masofani hisoblash (sm)
  // Tovush tezligi: 343 m/s = 0.034 sm/μs
  // /2 chunki boradi va qaytadi
  float distance = duration * 0.034 / 2;

  // 4. Natijani chiqarish
  Serial.print("Masofa: ");
  Serial.print(distance);
  Serial.println(" sm");

  delay(500);
}`}</CodeBlock>

    <SimBtn k="ultrasonic-hcsr04" label="🚀 HC-SR04 loyihasini simulyatorda ochish" />

    <h2>Qayerda ishlatiladi?</h2>
    <ul>
      <li>🤖 <strong>To'siqdan qochuvchi robot</strong> — oldida to'siq bormi tekshiradi</li>
      <li>🚗 <strong>Park sensori</strong> — avtomobil yaqinlashganda signal beradi</li>
      <li>🚰 <strong>Suv sathi o'lchash</strong> — tankning to'lganini aniqlaydi</li>
      <li>🚪 <strong>Avtomatik eshik</strong> — odam yaqinlashganda ochiladi</li>
      <li>📏 <strong>Raqamli metr</strong> — devor va mebel o'lchash qurilmasi</li>
    </ul>

    <h2>Keng tarqalgan xatolar</h2>
    <ul>
      <li>❌ <strong>3.3V ga ulash</strong> — HC-SR04 faqat 5V da ishlaydi (ESP32 uchun kuchlanish bo'lgich kerak)</li>
      <li>❌ <strong>Yumshoq yuzalarni o'lchash</strong> — mato, ko'pik ultrasonik to'lqinni yutadi, noto'g'ri natija beradi</li>
      <li>❌ <strong>2 sm dan yaqin o'lchash</strong> — minimal masofa 2 sm, undan yaqinda ishlamaydi</li>
    </ul>

    <h2>📹 Video darsliklar</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=ZejQOX69K5M" target="_blank" rel="noopener noreferrer">HC-SR04 bilan masofani o'lchash (boshlang'ich)</a></li>
      <li><a href="https://www.youtube.com/watch?v=aLkkAsAGKO0" target="_blank" rel="noopener noreferrer">Ultrasonik sensor — to'liq tushuntirish</a></li>
    </ul>

    <div className="docs-callout">
      <strong>Maslahat:</strong> Aniqroq natija uchun 3 marta o'lchab o'rtacha qiymat oling. Shuningdek,
      haroratga qarab tovush tezligini korrektsiya qilsangiz, ±1mm gacha aniqlik olishingiz mumkin!
    </div>
  </div>
);

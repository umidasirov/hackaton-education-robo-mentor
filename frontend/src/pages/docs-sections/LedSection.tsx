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

export const LedSection: React.FC = () => (
  <div className="docs-section">
    <span className="docs-label">// led</span>
    <h1>💡 LED (Yorituvchi diod)</h1>

    <h2>LED nima?</h2>
    <p>
      LED (Light Emitting Diode) — elektr tokini <strong>yorug'likka aylantiradigan</strong> yarim
      o'tkazgichli element. Oddiy lampochkadan farqi — kam energiya sarflaydi, uzoq ishlaydi
      (50 000+ soat) va juda tez yonadi/o'chadi (nanosekundlarda).
    </p>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/LED%2C_5mm%2C_green_%28en%29.svg/300px-LED%2C_5mm%2C_green_%28en%29.svg.png"
      alt="LED tuzilishi" style={{ maxWidth: 280, margin: '16px 0', borderRadius: 8, background: '#fff', padding: 8 }} />

    <h2>Ishlash prinsipi</h2>
    <p>
      LED ichida ikki qatlam yarim o'tkazgich bor: <strong>p-turi</strong> (musbat) va <strong>n-turi</strong> (manfiy).
      Tok to'g'ri yo'nalishda o'tganda elektronlar "tuynuk"lar bilan birlashadi va <strong>fotonlar</strong> (yorug'lik)
      chiqaradi. Yorug'lik rangi yarim o'tkazgich materialiga bog'liq.
    </p>
    <ul>
      <li><strong>Anod (+)</strong> — uzunroq oyoqcha, tok kirish tomoni</li>
      <li><strong>Katod (-)</strong> — qisqaroq oyoqcha (yassiroq tomon), GND ga ulanadi</li>
      <li><strong>To'g'ri kuchlanish:</strong> qizil ≈ 1.8V, yashil ≈ 2.2V, ko'k/oq ≈ 3.0-3.3V</li>
      <li><strong>Maksimal tok:</strong> odatda 20 mA (oshsa — kuyadi!)</li>
    </ul>

    <h2>Nega rezistor kerak?</h2>
    <p>
      Arduino pini 5V beradi, lekin LED faqat ~2V "yeydi". Qolgan 3V ni rezistor "yutadi".
      Rezistorsiz LED ga juda ko'p tok o'tadi va u <strong>kuyib ketadi</strong>. Rezistor qiymatini
      Ohm qonuni bilan hisoblaymiz:
    </p>
    <p><code>R = (Vpin - Vled) / I = (5V - 2V) / 0.02A = 150Ω</code> — amalda 220Ω ishlatiladi (xavfsizroq).</p>

    <h2>Arduino ga ulash</h2>
    <table>
      <thead><tr><th>LED pin</th><th>Ulash</th><th>Izoh</th></tr></thead>
      <tbody>
        <tr><td>Anod (+)</td><td>220Ω rezistor orqali → Arduino pin 13</td><td>Raqamli chiqish</td></tr>
        <tr><td>Katod (-)</td><td>Arduino GND</td><td>Yer</td></tr>
      </tbody>
    </table>
    <img src="https://docs.arduino.cc/static/a3ab157b0a1dfb39f4cfa36c66e3dbfe/29114/schematic.png"
      alt="LED ulanish sxemasi" style={{ maxWidth: 400, margin: '16px 0', borderRadius: 8 }} />

    <h2>Kod misoli</h2>
    <CodeBlock language="cpp">{`// LED yoqish va o'chirish (Blink)
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);  // 13-pinni chiqish qilish
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // LED yonadi
  delay(1000);                  // 1 soniya kutish
  digitalWrite(LED_PIN, LOW);  // LED o'chadi
  delay(1000);                  // 1 soniya kutish
}`}</CodeBlock>

    <h3>PWM bilan yorqinlikni boshqarish</h3>
    <CodeBlock language="cpp">{`// LED yorqinligini asta-sekin o'zgartirish (Fade)
#define LED_PIN 9  // PWM pini (3, 5, 6, 9, 10, 11)

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Asta-sekin yoqish
  for(int i = 0; i <= 255; i += 5) {
    analogWrite(LED_PIN, i);
    delay(30);
  }
  // Asta-sekin o'chirish
  for(int i = 255; i >= 0; i -= 5) {
    analogWrite(LED_PIN, i);
    delay(30);
  }
}`}</CodeBlock>

    <SimBtn k="led-blink" label="🚀 LED Blink loyihasini simulyatorda ochish" />

    <h2>Keng tarqalgan xatolar</h2>
    <ul>
      <li>❌ <strong>Rezistorsiz ulash</strong> — LED kuyadi (ortiqcha tok)</li>
      <li>❌ <strong>Teskari ulash</strong> — LED yonmaydi (zarar yetmaydi, faqat aylantirsangiz bo'ldi)</li>
      <li>❌ <strong>Analog pin ishlatish</strong> — analogWrite faqat PWM pinlarida ishlaydi (3, 5, 6, 9, 10, 11)</li>
    </ul>

    <h2>📹 Video darsliklar</h2>
    <ul>
      <li><a href="https://www.youtube.com/watch?v=G_CVMbZTLDQ" target="_blank" rel="noopener noreferrer">Arduino LED Blink — boshlang'ich darsi</a></li>
      <li><a href="https://www.youtube.com/watch?v=sNkERQlK8j8" target="_blank" rel="noopener noreferrer">LED va rezistor — nima uchun kerak?</a></li>
    </ul>

    <div className="docs-callout">
      <strong>Maslahat:</strong> LED — har qanday loyihaning birinchi qadami. Agar LED bilan ishlashni tushunib
      olsangiz, boshqa barcha komponentlarni boshqarish osonlashadi!
    </div>
  </div>
);

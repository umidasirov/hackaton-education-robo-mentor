/**
 * Loyihalar — darsga o'xshash to'liq instruksiyalar.
 *
 * Har loyiha: card (tashqi ko'rinish), to'liq instruksiya (detallar, ulanish,
 * bosqichlar), va tayyor ExampleProject (simulyatorga yuklash uchun).
 */

import type { ExampleProject } from './examples';

export interface ProjectStep {
  title: string;
  description: string;
  /** Kod (ixtiyoriy, shu bosqichda yoziladigan kod) */
  code?: string;
}

export interface ProjectTutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'boshlang\'ich' | 'o\'rta' | 'murakkab';
  duration: string;
  image: string;
  /** Kerak bo'ladigan detallar */
  parts: Array<{
    name: string;
    quantity: number;
    description: string;
  }>;
  /** Nimani o'rganadi */
  skills: string[];
  /** Bosqichma-bosqich instruksiya */
  steps: ProjectStep[];
  /** Simulyatorga yuklanadigan tayyor loyiha */
  example: ExampleProject;
  /** AI tutor uchun kontekst — loyiha haqida qisqa tavsif */
  aiContext: string;
}

export const projectTutorials: ProjectTutorial[] = [
  {
    id: 'smart-doorbell',
    title: 'Aqlli damafon',
    description: 'Ultrasonik sensor bilan eshikka yaqinlashgan odamni aniqlaydigan va melodiya chaladigan aqlli damafon yasaymiz. PIR harakat sensori + buzzer + LED = to\'liq eshik qo\'ng\'irog\'i tizimi.',
    difficulty: 'boshlang\'ich',
    duration: '30-45 daqiqa',
    image: 'https://static.insales-cdn.com/files/1/3821/19427053/original/1_a113f1afb82758a7a387ce2d28ad30fc.jpg',
    parts: [
      { name: 'Arduino Uno', quantity: 1, description: 'Asosiy mikrokontroller — barcha komponentlarni boshqaradi' },
      { name: 'HC-SR04 ultrasonik sensor', quantity: 1, description: 'Eshik oldida odam bormi — masofani o\'lchaydi' },
      { name: 'Buzzer (passiv)', quantity: 1, description: 'Damafon ovozini chiqaradi — melodiya chaladi' },
      { name: 'LED (yashil)', quantity: 1, description: 'Tizim ishlayotganini ko\'rsatadi' },
      { name: 'LED (qizil)', quantity: 1, description: 'Odam aniqlanganda yonadi' },
      { name: 'Rezistor 220Ω', quantity: 2, description: 'LEDlarni himoya qiladi (ortiqcha tokdan)' },
      { name: 'Simlar', quantity: 10, description: 'Komponentlarni ulash uchun' },
    ],
    skills: [
      'Ultrasonik sensor bilan masofani o\'lchash',
      'Buzzer bilan melodiya chalish (tone funksiyasi)',
      'Shartli operatorlar (if/else) bilan qaror qabul qilish',
      'Bir nechta komponentni birgalikda boshqarish',
      'Serial Monitor bilan debug qilish',
    ],
    steps: [
      {
        title: '1-qadam: Loyihani tushunish',
        description: `Biz nima yasayapmiz?

**Aqlli damafon** — eshik oldiga o'rnatiladi. HC-SR04 ultrasonik sensor doimiy ravishda masofani o'lchaydi. Agar odam 50 sm dan yaqin kelsa:
- 🔴 Qizil LED yonadi
- 🔊 Buzzer melodiya chaladi (ding-dong)
- 📟 Serial Monitor da "Mehmon keldi!" xabari chiqadi

Odam ketgandan keyin:
- 🟢 Yashil LED yonadi (kutish rejimi)
- Buzzer to'xtaydi

Bu aslida ko'p uylarning eshik qo'ng'irog'i ishlash prinsipiga o'xshaydi!`,
      },
      {
        title: '2-qadam: Komponentlarni joylashtirish',
        description: `Simulyatorda quyidagi komponentlarni joylashtiring:

1. **Arduino Uno** — markazga
2. **HC-SR04** — yuqoriga (eshik tomoni, "ko'z" qismi tashqariga)
3. **Buzzer** — o'ng tomonga
4. **Yashil LED + 220Ω rezistor** — chap pastga
5. **Qizil LED + 220Ω rezistor** — o'ng pastga

Har bir komponentni "+" tugmasi orqali qo'shing.`,
      },
      {
        title: '3-qadam: Simlarni ulash',
        description: `Komponentlarni quyidagicha ulang:

**HC-SR04 (ultrasonik sensor):**
| HC-SR04 | Arduino | Sim rangi |
|---------|---------|-----------|
| VCC | 5V | 🔴 Qizil |
| GND | GND | ⚫ Qora |
| Trig | Pin 9 | 🟢 Yashil |
| Echo | Pin 10 | 🔵 Ko'k |

**Buzzer:**
| Buzzer | Arduino |
|--------|---------|
| + (uzun) | Pin 8 |
| - (qisqa) | GND |

**Yashil LED:**
Arduino pin 7 → 220Ω rezistor → LED anod (+) → LED katod (-) → GND

**Qizil LED:**
Arduino pin 6 → 220Ω rezistor → LED anod (+) → LED katod (-) → GND

⚡ **Muhim:** LEDlarni rezistorsiz ulamang! Aks holda kuyib ketadi.`,
      },
      {
        title: '4-qadam: Kodni yozish',
        description: `Endi eng qiziq qism — dasturni yozamiz! Kod nima qiladi:

1. Har 200ms da masofani o'lchaydi
2. Agar masofa < 50 sm → "mehmon keldi" rejimi
3. Agar masofa >= 50 sm → "kutish" rejimi

Quyidagi kodni editorga kiriting:`,
        code: `// =======================================
// AQLLI DAMAFON — vexio loyihasi
// =======================================
// HC-SR04: masofa o'lchash
// Buzzer: melodiya chalish
// LED: holat ko'rsatish

// --- Pin lar ---
#define TRIG_PIN 9      // Ultrasonik Trig
#define ECHO_PIN 10     // Ultrasonik Echo
#define BUZZER_PIN 8    // Buzzer
#define GREEN_LED 7     // Kutish rejimi (yashil)
#define RED_LED 6       // Mehmon aniqlandi (qizil)

// --- Melodiya notalari ---
#define NOTE_E5 659
#define NOTE_C5 523
#define NOTE_G4 392

// --- O'zgaruvchilar ---
float masofa = 0;
bool mehmonBor = false;
unsigned long oxirgiMelodiya = 0;

void setup() {
  // Pinlarni sozlash
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  Serial.begin(9600);
  Serial.println("=== Aqlli Damafon ===");
  Serial.println("Tizim tayyor! Kutish rejimi...");

  // Boshlang'ich holat: yashil LED yonadi
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
}

void loop() {
  // 1. Masofani o'lchash
  masofa = masofaOlchash();

  // 2. Serial Monitor ga chiqarish
  Serial.print("Masofa: ");
  Serial.print(masofa);
  Serial.print(" sm");

  // 3. Qaror qabul qilish
  if (masofa > 0 && masofa < 50) {
    // MEHMON KELDI!
    if (!mehmonBor) {
      Serial.println(" --> MEHMON KELDI!");
      mehmonBor = true;
    }

    // Qizil LED yonadi, yashil o'chadi
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);

    // Melodiya chalish (har 3 soniyada)
    if (millis() - oxirgiMelodiya > 3000) {
      melodiyaChalish();
      oxirgiMelodiya = millis();
    }
  } else {
    // KUTISH REJIMI
    if (mehmonBor) {
      Serial.println(" --> Mehmon ketdi. Kutish rejimi.");
      mehmonBor = false;
      noTone(BUZZER_PIN);
    }

    // Yashil LED yonadi, qizil o'chadi
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    Serial.println(" | Kutish...");
  }

  delay(200);
}

// --- Masofani o'lchash funksiyasi ---
float masofaOlchash() {
  // Trigger impuls yuborish
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Echo vaqtini o'lchash
  long davomiylik = pulseIn(ECHO_PIN, HIGH, 25000);

  if (davomiylik == 0) return -1; // Signal qaytmadi

  // Masofani hisoblash (sm)
  return davomiylik * 0.034 / 2;
}

// --- Damafon melodiyasi (Ding-Dong) ---
void melodiyaChalish() {
  // Ding
  tone(BUZZER_PIN, NOTE_E5, 300);
  delay(350);
  // Dong
  tone(BUZZER_PIN, NOTE_C5, 500);
  delay(550);
  noTone(BUZZER_PIN);
}`,
      },
      {
        title: '5-qadam: Sinab ko\'rish',
        description: `Hammasi tayyor! Endi sinab ko'ramiz:

1. **Compile + Run** tugmasini bosing
2. **Serial Monitor** ni oching — "Tizim tayyor!" xabari chiqadi
3. HC-SR04 sensorini sichqoncha bilan boshqaring:
   - Masofani **50 sm dan kam** qiling → 🔴 LED yonadi + melodiya chaladi
   - Masofani **50 sm dan ko'p** qiling → 🟢 LED yonadi, kutish rejimi

**Natija:**
- Odam yaqinlashganda "Ding-Dong" eshitiladi
- Serial Monitor da barcha o'lchashlar ko'rinadi
- Odam ketganda tizim kutish rejimiga qaytadi

🎉 Tabriklaymiz! Siz birinchi aqlli qurilmangizni yaratdingiz!`,
      },
      {
        title: '6-qadam: Yaxshilash g\'oyalari',
        description: `Loyihani kengaytiring:

- **WiFi** qo'shing (ESP32 bilan) — telefonga xabar yuborsin
- **Kamera** qo'shing — kim kelganini rasmga olsin
- **LCD displey** qo'shing — masofani ko'rsatsin
- **Tugma** qo'shing — ichkaridan eshikni ochish uchun
- **Qulf (servo)** qo'shing — aqlli qulf tizimi
- **Turli melodiyalar** qo'shing — mehmon va pochta uchun turlicha

Bu oddiy loyihadan to'liq **aqlli uy tizimiga** o'sishi mumkin!`,
      },
    ],
    example: {
      id: 'project-smart-doorbell',
      title: 'Aqlli damafon',
      description: 'HC-SR04 + Buzzer + LED = aqlli eshik qo\'ng\'irog\'i',
      category: 'sensors' as const,
      difficulty: 'beginner' as const,
      boardType: 'arduino-uno' as const,
      code: `// AQLLI DAMAFON
#define TRIG_PIN 9
#define ECHO_PIN 10
#define BUZZER_PIN 8
#define GREEN_LED 7
#define RED_LED 6

#define NOTE_E5 659
#define NOTE_C5 523

float masofa = 0;
bool mehmonBor = false;
unsigned long oxirgiMelodiya = 0;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("=== Aqlli Damafon ===");
  digitalWrite(GREEN_LED, HIGH);
}

void loop() {
  masofa = masofaOlchash();
  Serial.print("Masofa: ");
  Serial.print(masofa);
  Serial.print(" sm");

  if (masofa > 0 && masofa < 50) {
    if (!mehmonBor) { Serial.println(" --> MEHMON!"); mehmonBor = true; }
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    if (millis() - oxirgiMelodiya > 3000) {
      tone(BUZZER_PIN, NOTE_E5, 300); delay(350);
      tone(BUZZER_PIN, NOTE_C5, 500); delay(550);
      noTone(BUZZER_PIN);
      oxirgiMelodiya = millis();
    }
  } else {
    if (mehmonBor) { Serial.println(" --> Kutish"); mehmonBor = false; noTone(BUZZER_PIN); }
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    Serial.println(" | Kutish...");
  }
  delay(200);
}

float masofaOlchash() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long d = pulseIn(ECHO_PIN, HIGH, 25000);
  if (d == 0) return -1;
  return d * 0.034 / 2;
}`,
      components: [
        { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 200, y: 200, properties: {} },
        { type: 'wokwi-hc-sr04', id: 'hcsr04-1', x: 500, y: 50, properties: {} },
        { type: 'wokwi-buzzer', id: 'buzzer-1', x: 550, y: 250, properties: {} },
        { type: 'wokwi-led', id: 'green-led', x: 100, y: 400, properties: { color: 'green' } },
        { type: 'wokwi-resistor', id: 'r-green', x: 50, y: 400, properties: { resistance: '220' } },
        { type: 'wokwi-led', id: 'red-led', x: 550, y: 400, properties: { color: 'red' } },
        { type: 'wokwi-resistor', id: 'r-red', x: 500, y: 400, properties: { resistance: '220' } },
      ],
      wires: [
        { id: 'w1', start: { componentId: 'hcsr04-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
        { id: 'w2', start: { componentId: 'hcsr04-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
        { id: 'w3', start: { componentId: 'hcsr04-1', pinName: 'TRIG' }, end: { componentId: 'arduino-uno', pinName: '9' }, color: '#22c55e' },
        { id: 'w4', start: { componentId: 'hcsr04-1', pinName: 'ECHO' }, end: { componentId: 'arduino-uno', pinName: '10' }, color: '#3b82f6' },
        { id: 'w5', start: { componentId: 'buzzer-1', pinName: '1' }, end: { componentId: 'arduino-uno', pinName: '8' }, color: '#a855f7' },
        { id: 'w6', start: { componentId: 'buzzer-1', pinName: '2' }, end: { componentId: 'arduino-uno', pinName: 'GND.2' }, color: '#374151' },
        { id: 'w7', start: { componentId: 'arduino-uno', pinName: '7' }, end: { componentId: 'r-green', pinName: '1' }, color: '#22c55e' },
        { id: 'w8', start: { componentId: 'r-green', pinName: '2' }, end: { componentId: 'green-led', pinName: 'A' }, color: '#22c55e' },
        { id: 'w9', start: { componentId: 'green-led', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.3' }, color: '#374151' },
        { id: 'w10', start: { componentId: 'arduino-uno', pinName: '6' }, end: { componentId: 'r-red', pinName: '1' }, color: '#f97316' },
        { id: 'w11', start: { componentId: 'r-red', pinName: '2' }, end: { componentId: 'red-led', pinName: 'A' }, color: '#f97316' },
        { id: 'w12', start: { componentId: 'red-led', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.4' }, color: '#374151' },
      ],
    },
    aiContext: 'Talaba aqlli damafon loyihasi ustida ishlayapti. HC-SR04 ultrasonik sensor masofani o\'lchaydi, 50sm dan yaqin bo\'lsa buzzer melodiya chaladi va qizil LED yonadi. Yashil LED kutish rejimida. Loyiha pinlari: Trig=9, Echo=10, Buzzer=8, GreenLED=7, RedLED=6.',
  },
];

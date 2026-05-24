/**
 * Hujjatlar sahifasi uchun tayyor loyihalar.
 *
 * Har datchik / komponent uchun simulyatorda ochilgan tayyor loyiha:
 * board + komponentlar + simlar + kod. "Simulyatorda ko'rish" tugmasi
 * bosilganda loadExample() orqali yuklanadi.
 */

import type { ExampleProject } from './examples';

export const docsExamples: Record<string, ExampleProject> = {

  /* ─── HC-SR04 Ultrasonik ────────────────────────────────── */
  'ultrasonic-hcsr04': {
    id: 'docs-ultrasonic-hcsr04',
    title: 'HC-SR04 Ultrasonik masofa sensori',
    description: 'Ultrasonik datchik bilan masofani o\'lchash',
    category: 'sensors',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// HC-SR04 Ultrasonik masofa sensori
// Trig: 9, Echo: 10
#define TRIG_PIN 9
#define ECHO_PIN 10

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 tayyor!");
}

void loop() {
  // Ultrasonik impuls yuborish
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Qaytgan vaqtni o'lchash
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;

  Serial.print("Masofa: ");
  Serial.print(distance);
  Serial.println(" cm");
  delay(500);
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-hc-sr04', id: 'hcsr04-1', x: 400, y: 50, properties: {} },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'hcsr04-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'hcsr04-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'hcsr04-1', pinName: 'TRIG' }, end: { componentId: 'arduino-uno', pinName: '9' }, color: '#22c55e' },
      { id: 'w4', start: { componentId: 'hcsr04-1', pinName: 'ECHO' }, end: { componentId: 'arduino-uno', pinName: '10' }, color: '#3b82f6' },
    ],
  },

  /* ─── LED Blink ─────────────────────────────────────────── */
  'led-blink': {
    id: 'docs-led-blink',
    title: 'LED yoqish va o\'chirish',
    description: 'Klassik LED Blink loyihasi',
    category: 'basics',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// LED Blink - klassik misol
// LED 13-pinga ulangan, rezistor bilan
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // LED yonadi
  delay(1000);                  // 1 soniya
  digitalWrite(LED_PIN, LOW);  // LED o'chadi
  delay(1000);
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-led', id: 'led-1', x: 400, y: 100, properties: { color: 'red' } },
      { type: 'wokwi-resistor', id: 'r-1', x: 350, y: 100, properties: { resistance: '220' } },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'arduino-uno', pinName: '13' }, end: { componentId: 'r-1', pinName: '1' }, color: '#22c55e' },
      { id: 'w2', start: { componentId: 'r-1', pinName: '2' }, end: { componentId: 'led-1', pinName: 'A' }, color: '#22c55e' },
      { id: 'w3', start: { componentId: 'led-1', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
    ],
  },

  /* ─── DHT22 harorat + namlik ────────────────────────────── */
  'dht22-temp': {
    id: 'docs-dht22-temp',
    title: 'DHT22 harorat va namlik sensori',
    description: 'DHT22 bilan harorat va namlikni o\'lchash',
    category: 'sensors',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    libraries: ['DHT sensor library'],
    code: `// DHT22 harorat va namlik sensori
#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("DHT22 tayyor!");
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if(isnan(h) || isnan(t)) {
    Serial.println("DHT o'qish xatosi!");
    return;
  }

  Serial.print("Namlik: ");
  Serial.print(h);
  Serial.print("% | Harorat: ");
  Serial.print(t);
  Serial.println(" C");
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-dht22', id: 'dht22-1', x: 400, y: 80, properties: {} },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'dht22-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'dht22-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'dht22-1', pinName: 'SDA' }, end: { componentId: 'arduino-uno', pinName: '2' }, color: '#eab308' },
    ],
  },

  /* ─── PIR harakat sensori ───────────────────────────────── */
  'pir-motion': {
    id: 'docs-pir-motion',
    title: 'PIR harakat sensori',
    description: 'Harakat aniqlaganda LEDni yoqish',
    category: 'sensors',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// PIR harakat sensori + LED
#define PIR_PIN 2
#define LED_PIN 13

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  delay(2000); // PIR qizishi uchun
  Serial.println("PIR tayyor!");
}

void loop() {
  if(digitalRead(PIR_PIN) == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Harakat aniqlandi!");
    delay(2000);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-pir-motion-sensor', id: 'pir-1', x: 400, y: 60, properties: {} },
      { type: 'wokwi-led', id: 'led-1', x: 450, y: 200, properties: { color: 'green' } },
      { type: 'wokwi-resistor', id: 'r-1', x: 400, y: 200, properties: { resistance: '220' } },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'pir-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'pir-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'pir-1', pinName: 'OUT' }, end: { componentId: 'arduino-uno', pinName: '2' }, color: '#22c55e' },
      { id: 'w4', start: { componentId: 'arduino-uno', pinName: '13' }, end: { componentId: 'r-1', pinName: '1' }, color: '#22c55e' },
      { id: 'w5', start: { componentId: 'r-1', pinName: '2' }, end: { componentId: 'led-1', pinName: 'A' }, color: '#22c55e' },
      { id: 'w6', start: { componentId: 'led-1', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.2' }, color: '#374151' },
    ],
  },

  /* ─── Servo motor ───────────────────────────────────────── */
  'servo-motor': {
    id: 'docs-servo-motor',
    title: 'Servo motor boshqarish',
    description: 'Servomotorni 0-180 gradus aylantirsih',
    category: 'basics',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// Servomotor boshqarish
#include <Servo.h>
Servo myservo;

void setup() {
  myservo.attach(9);
  Serial.begin(9600);
}

void loop() {
  for(int angle = 0; angle <= 180; angle += 10) {
    myservo.write(angle);
    Serial.print("Burchak: ");
    Serial.println(angle);
    delay(200);
  }
  for(int angle = 180; angle >= 0; angle -= 10) {
    myservo.write(angle);
    delay(200);
  }
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-servo', id: 'servo-1', x: 400, y: 100, properties: {} },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'servo-1', pinName: 'V+' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'servo-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'servo-1', pinName: 'PWM' }, end: { componentId: 'arduino-uno', pinName: '9' }, color: '#a855f7' },
    ],
  },

  /* ─── Potensiiometr + LED ───────────────────────────────── */
  'potentiometer-led': {
    id: 'docs-potentiometer-led',
    title: 'Potensiometr bilan LED yorqinligi',
    description: 'Potensiometr bilan LED yorqinligini boshqarish',
    category: 'basics',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// Potensiometr bilan LED yorqinligi
#define POT_PIN A0
#define LED_PIN 9

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int potValue = analogRead(POT_PIN);
  int brightness = map(potValue, 0, 1023, 0, 255);

  analogWrite(LED_PIN, brightness);
  Serial.print("Pot: ");
  Serial.print(potValue);
  Serial.print(" -> LED: ");
  Serial.println(brightness);
  delay(100);
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-potentiometer', id: 'pot-1', x: 400, y: 50, properties: {} },
      { type: 'wokwi-led', id: 'led-1', x: 450, y: 200, properties: { color: 'blue' } },
      { type: 'wokwi-resistor', id: 'r-1', x: 400, y: 200, properties: { resistance: '220' } },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'pot-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'pot-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'pot-1', pinName: 'SIG' }, end: { componentId: 'arduino-uno', pinName: 'A0' }, color: '#3b82f6' },
      { id: 'w4', start: { componentId: 'arduino-uno', pinName: '9' }, end: { componentId: 'r-1', pinName: '1' }, color: '#a855f7' },
      { id: 'w5', start: { componentId: 'r-1', pinName: '2' }, end: { componentId: 'led-1', pinName: 'A' }, color: '#a855f7' },
      { id: 'w6', start: { componentId: 'led-1', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.2' }, color: '#374151' },
    ],
  },

  /* ─── NTC harorat sensori ───────────────────────────────── */
  'ntc-temperature': {
    id: 'docs-ntc-temperature',
    title: 'NTC harorat sensori',
    description: 'Termistor bilan harorat o\'lchash',
    category: 'sensors',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// NTC harorat sensori (termistor)
#define NTC_PIN A0

void setup() {
  Serial.begin(9600);
}

void loop() {
  int val = analogRead(NTC_PIN);
  float voltage = val * 5.0 / 1023.0;
  // Oddiy konversiya (to'g'ri bo'lmaydi, lekin namoyish uchun)
  float tempC = (voltage - 0.5) * 100;
  Serial.print("Analog: ");
  Serial.print(val);
  Serial.print(" | Harorat: ~");
  Serial.print(tempC);
  Serial.println(" C");
  delay(1000);
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-ntc-temperature-sensor', id: 'ntc-1', x: 400, y: 80, properties: {} },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'ntc-1', pinName: 'VCC' }, end: { componentId: 'arduino-uno', pinName: '5V' }, color: '#ef4444' },
      { id: 'w2', start: { componentId: 'ntc-1', pinName: 'GND' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'ntc-1', pinName: 'OUT' }, end: { componentId: 'arduino-uno', pinName: 'A0' }, color: '#3b82f6' },
    ],
  },

  /* ─── Buzzer melodik ────────────────────────────────────── */
  'buzzer-melody': {
    id: 'docs-buzzer-melody',
    title: 'Buzzer bilan melodiya',
    description: 'Passiv buzzer bilan nota chalish',
    category: 'basics',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// Buzzer bilan melodiya
#define BUZZER_PIN 8

// Nota chastotalari (Hz)
#define NOTE_C4 262
#define NOTE_D4 294
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_G4 392

int melody[] = {NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4};
int durations[] = {400, 400, 400, 400, 800};

void setup() {
  Serial.begin(9600);
  Serial.println("Melodiya boshlandi!");
}

void loop() {
  for(int i = 0; i < 5; i++) {
    tone(BUZZER_PIN, melody[i], durations[i]);
    delay(durations[i] + 50);
  }
  noTone(BUZZER_PIN);
  delay(2000);
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-buzzer', id: 'buz-1', x: 400, y: 100, properties: {} },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'buz-1', pinName: '1' }, end: { componentId: 'arduino-uno', pinName: '8' }, color: '#22c55e' },
      { id: 'w2', start: { componentId: 'buz-1', pinName: '2' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
    ],
  },

  /* ─── Tugma + LED ───────────────────────────────────────── */
  'pushbutton-led': {
    id: 'docs-pushbutton-led',
    title: 'Tugma bilan LED boshqarish',
    description: 'Tugma bosilganda LED yonadi',
    category: 'basics',
    difficulty: 'beginner',
    boardType: 'arduino-uno',
    code: `// Tugma bilan LED boshqarish
#define BUTTON_PIN 2
#define LED_PIN 13

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if(digitalRead(BUTTON_PIN) == LOW) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Tugma bosildi - LED yondi!");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
    components: [
      { type: 'wokwi-arduino-uno', id: 'arduino-uno', x: 100, y: 150, properties: {} },
      { type: 'wokwi-pushbutton', id: 'btn-1', x: 400, y: 50, properties: {} },
      { type: 'wokwi-led', id: 'led-1', x: 450, y: 200, properties: { color: 'yellow' } },
      { type: 'wokwi-resistor', id: 'r-1', x: 400, y: 200, properties: { resistance: '220' } },
    ],
    wires: [
      { id: 'w1', start: { componentId: 'btn-1', pinName: '1.l' }, end: { componentId: 'arduino-uno', pinName: '2' }, color: '#22c55e' },
      { id: 'w2', start: { componentId: 'btn-1', pinName: '2.r' }, end: { componentId: 'arduino-uno', pinName: 'GND.1' }, color: '#374151' },
      { id: 'w3', start: { componentId: 'arduino-uno', pinName: '13' }, end: { componentId: 'r-1', pinName: '1' }, color: '#22c55e' },
      { id: 'w4', start: { componentId: 'r-1', pinName: '2' }, end: { componentId: 'led-1', pinName: 'A' }, color: '#22c55e' },
      { id: 'w5', start: { componentId: 'led-1', pinName: 'C' }, end: { componentId: 'arduino-uno', pinName: 'GND.2' }, color: '#374151' },
    ],
  },
};

/**
 * Barcha umumiy, indekslanadigan marshrutlar va ularning SEO metamaʼlumotlari uchun yagona manba.
 * Quyidagilar uchun ishlatiladi:
 *  1. scripts/generate-sitemap.mjs  → sitemap.xml ni yaratadi
 *  2. scripts/prerender-seo.mjs     → har bir marshrut uchun oldindan tayyorlangan HTML yaratadi
 *  3. Page komponentlari (getSeoMeta orqali) → useSEO() hooki
 *
 * `noindex: true` boʻlgan marshrutlar sitemapdan chiqarib tashlanadi.
 * `seoMeta` ga ega boʻlgan marshrutlar qurilish vaqtida oldindan tayyorlangan HTML oladi.
 */

const DOMAIN = 'https://robomentor.uz';

export interface SeoMeta {
  title: string;
  description: string;
  url: string;
}

export interface SeoRoute {
  path: string;
  /** 0.0 – 1.0 (standart 0.5) */
  priority?: number;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Agar true boʻlsa, sitemapdan chiqarib tashlanadi */
  noindex?: boolean;
  /** SEO metamaʼlumotlari — agar mavjud boʻlsa, bu marshrut qurilish vaqtida oldindan tayyorlangan HTML sahifasini oladi. */
  seoMeta?: SeoMeta;
}

/** Berilgan yoʻl uchun SEO metamaʼlumotlarini qidirish. */
export function getSeoMeta(path: string): SeoMeta | undefined {
  return SEO_ROUTES.find(r => r.path === path)?.seoMeta;
}

export const SEO_ROUTES: SeoRoute[] = [
  // ── Asosiy sahifalar
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
    seoMeta: {
      title: 'Robo Mentor — Bepul Koʻp Platli Emulator | Arduino · ESP32 · RP2040 · RISC-V · Raspberry Pi',
      description: 'Robo Mentor — bepul, ochiq manbali koʻp platli emulator. 5 protsessor arxitekturasida 19 ta plata: Arduino Uno/Mega/ATtiny (AVR8), ESP32/ESP32-S3 (Xtensa QEMU), ESP32-C3/CH32V003 (RISC-V), Raspberry Pi Pico (RP2040), Raspberry Pi 3 (Linux). 48+ komponent, bulut talab qilinmaydi.',
      url: `${DOMAIN}/`,
    },
  },
  { path: '/editor', priority: 0.9, changefreq: 'weekly' },
  {
    path: '/examples',
    priority: 0.8,
    changefreq: 'weekly',
    seoMeta: {
      title: 'Arduino Simulyatori Misollari — 18+ Sketchni Bir Zumda Ishga Tushiring | Robo Mentor',
      description: 'LEDlar, datchiklar, displeylar va oʻyinlar bilan 18+ interaktiv Arduino misollarini koʻring. Toʻliq brauzeringizda ishlaydi — bepul, oʻrnatish talab qilinmaydi, akkaunt kerak emas.',
      url: `${DOMAIN}/examples`,
    },
  },

  // ── Hujjatlar
  { path: '/docs', priority: 0.8, changefreq: 'monthly',
    seoMeta: { title: 'Kirish | Robo Mentor Hujjatlari', description: 'Robo Mentor haqida bilib oling — bepul va ochiq manbali Arduino emulatori, AVR8 va RP2040 protsessorlari va 48+ interaktiv elektron komponentlari bilan.', url: `${DOMAIN}/docs` } },
  { path: '/docs/intro', priority: 0.8, changefreq: 'monthly',
    seoMeta: { title: 'Kirish | Robo Mentor Hujjatlari', description: 'Robo Mentor haqida bilib oling — bepul va ochiq manbali Arduino emulatori, AVR8 va RP2040 protsessorlari va 48+ interaktiv elektron komponentlari bilan.', url: `${DOMAIN}/docs/intro` } },
  { path: '/docs/getting-started', priority: 0.8, changefreq: 'monthly',
    seoMeta: { title: 'Boshlash | Robo Mentor Hujjatlari', description: 'Robo Mentor bilan ishni boshlang: veb-muharrirdan foydalaning, Docker bilan oʻz serveringizda ishga tushiring yoki mahalliy muhitni sozlang. Bir necha daqiqada birinchi sketchni simulyatsiya qiling.', url: `${DOMAIN}/docs/getting-started` } },
  { path: '/docs/emulator', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'Emulator Arxitekturasi | Robo Mentor Hujjatlari', description: 'Robo Mentor qanday qilib AVR8 (ATmega328p), RP2040 va RISC-V (ESP32-C3) protsessorlarini emulyatsiya qiladi. Bajarilish sikli, periferiya qurilmalari va barcha qoʻllab-quvvatlanadigan platlar uchun pin xaritasi haqida batafsil.', url: `${DOMAIN}/docs/emulator` } },
  { path: '/docs/esp32-emulation', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'ESP32 Emulyatsiyasi (Xtensa) | Robo Mentor Hujjatlari', description: 'ESP32 va ESP32-S3 (Xtensa LX6/LX7) uchun QEMU asosidagi emulyatsiya. lcgamboa fork, libqemu-xtensa, GPIO, WiFi, I2C, SPI, RMT/NeoPixel va LEDC/PWM haqida.', url: `${DOMAIN}/docs/esp32-emulation` } },
  { path: '/docs/riscv-emulation', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'RISC-V Emulyatsiyasi (ESP32-C3) | Robo Mentor Hujjatlari', description: 'Brauzerda RV32IMC emulyatori ESP32-C3, XIAO ESP32-C3 va C3 SuperMini uchun. Xotira xaritasi, GPIO, UART0, ESP32 tasvir tahlilchisi, RV32IMC buyruq tizimi va testlar toʻplami.', url: `${DOMAIN}/docs/riscv-emulation` } },
  { path: '/docs/rp2040-emulation', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'RP2040 Emulyatsiyasi (Raspberry Pi Pico) | Robo Mentor Hujjatlari', description: 'Robo Mentor qanday qilib Raspberry Pi Pico va Pico W ni rp2040js yordamida emulyatsiya qiladi: ARM Cortex-M0+ 133 MHz, GPIO, UART, ADC, I2C, SPI, PWM va WFI optimizatsiyasi.', url: `${DOMAIN}/docs/rp2040-emulation` } },
  { path: '/docs/raspberry-pi3-emulation', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'Raspberry Pi 3 Emulyatsiyasi (QEMU) | Robo Mentor Hujjatlari', description: 'Robo Mentor qanday qilib Raspberry Pi 3B ni QEMU raspi3b yordamida emulyatsiya qiladi: haqiqiy Raspberry Pi OS, Python + RPi.GPIO shim, ikki kanalli UART, VFS va koʻp platli ketma-ket koʻprik.', url: `${DOMAIN}/docs/raspberry-pi3-emulation` } },
  { path: '/docs/components', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'Komponentlar Maʼlumotnomasi | Robo Mentor Hujjatlari', description: 'Robo Mentordagi 48+ interaktiv elektron komponentlari uchun toʻliq maʼlumotnoma: LEDlar, displeylar, datchiklar, tugmalar, potensiometrlar va boshqalar. Ulanish va xususiyat tafsilotlarini oʻz ichiga oladi.', url: `${DOMAIN}/docs/components` } },
  { path: '/docs/architecture', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'Loyiha Arxitekturasi | Robo Mentor Hujjatlari', description: 'Robo Mentor tizim arxitekturasining batafsil tavsifi: frontend, backend, AVR8 emulyatsiya jarayoni, maʼlumotlar oqimi, Zustand doʻkonlari va sim tizimi.', url: `${DOMAIN}/docs/architecture` } },
  { path: '/docs/wokwi-libs', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'Wokwi Kutubxonalari | Robo Mentor Hujjatlari', description: 'Robo Mentor rasmiy Wokwi ochiq manbali kutubxonalarini qanday integratsiya qiladi: avr8js, wokwi-elements va rp2040js. Sozlamalar, yangilash va 48 ta komponent haqida.', url: `${DOMAIN}/docs/wokwi-libs` } },
  { path: '/docs/mcp', priority: 0.7, changefreq: 'monthly',
    seoMeta: { title: 'MCP Server | Robo Mentor Hujjatlari', description: 'Robo Mentor MCP serveri referansi: AI agentlarni (Claude, Cursor) Robo Mentor bilan integratsiya qilish. Asboblar, transport, sxema formati va misollar.', url: `${DOMAIN}/docs/mcp` } },
  { path: '/docs/setup', priority: 0.6, changefreq: 'monthly',
    seoMeta: { title: 'Loyiha Holati | Robo Mentor Hujjatlari', description: 'Robo Mentorning barcha amalga oshirilgan xususiyatlarining toʻliq holati: AVR emulyatsiyasi, komponent tizimi, sim tizimi, kod muharriri, misol loyihalar va keyingi qadamlar.', url: `${DOMAIN}/docs/setup` } },
  { path: '/docs/roadmap', priority: 0.6, changefreq: 'monthly',
    seoMeta: { title: 'Reja | Robo Mentor Hujjatlari', description: 'Robo Mentor loyihasining rejasi: nimalar amalga oshirilgan, nimalar bajarilmoqda va kelajakda qanday xususiyatlar qoʻshiladi.', url: `${DOMAIN}/docs/roadmap` } },

  // ── SEO kalit soʻz ochilish sahifalari
  {
    path: '/arduino-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul Onlayn Arduino Simulyatori — Brauzeringizda Sketchni Ishga Tushiring | Robo Mentor',
      description: 'Haqiqiy AVR8 emulyatsiyasiga ega bepul onlayn Arduino simulyatori. Arduino kodini yozing va LEDlar, datchiklar va 48+ komponent bilan simulyatsiya qiling — oʻrnatish yoʻq, akkaunt kerak emas, natijalar bir zumda.',
      url: `${DOMAIN}/arduino-simulator`,
    },
  },
  {
    path: '/arduino-emulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Arduino Emulatori — Haqiqiy AVR8 va RP2040 Emulyatsiyasi, Bepul | Robo Mentor',
      description: '16 MHz da tsikl-aniq AVR8 emulyatsiyasiga ega bepul, ochiq manbali Arduino emulatori. Arduino Uno, Nano, Mega va Raspberry Pi Piconi brauzeringizda emulyatsiya qiling — bulut yoʻq, oʻrnatish yoʻq.',
      url: `${DOMAIN}/arduino-emulator`,
    },
  },
  {
    path: '/atmega328p-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'ATmega328P Simulyatori — Bepul Brauzer Asosidagi AVR8 Emulyatsiyasi | Robo Mentor',
      description: 'ATmega328P kodini brauzeringizda simulyatsiya qiling. 16 MHz da toʻliq AVR8 emulyatsiyasi — PORTB, PORTC, PORTD, Timer0/1/2, ADC, USART — 48+ interaktiv komponent bilan. Bepul va ochiq manba.',
      url: `${DOMAIN}/atmega328p-simulator`,
    },
  },
  {
    path: '/arduino-mega-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Arduino Mega 2560 Simulyatori — Bepul Onlayn AVR8 Emulatori | Robo Mentor',
      description: 'Arduino Mega 2560 (ATmega2560) kodini brauzeringizda bepul simulyatsiya qiling. 256 KB xotira, 54 raqamli pin, 16 analog kirish, 4 ketma-ket port — 48+ komponent bilan toʻliq AVR8 emulyatsiyasi.',
      url: `${DOMAIN}/arduino-mega-simulator`,
    },
  },
  {
    path: '/esp32-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul Onlayn ESP32 Simulyatori — Xtensa LX6 Emulyatsiyasi | Robo Mentor',
      description: 'ESP32 kodini brauzeringizda bepul simulyatsiya qiling. QEMU orqali 240 MHz da haqiqiy Xtensa LX6 emulyatsiyasi — ESP32 DevKit, ESP32-S3, ESP32-CAM. 48+ komponent, Serial Monitor, oʻrnatish yoʻq.',
      url: `${DOMAIN}/esp32-simulator`,
    },
  },
  {
    path: '/esp32-s3-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul ESP32-S3 Simulyatori — Xtensa LX7 Onlayn Emulyatsiyasi | Robo Mentor',
      description: 'ESP32-S3 kodini bepul simulyatsiya qiling. QEMU orqali 240 MHz da haqiqiy Xtensa LX7 ikki yadroli emulyatsiyasi — DevKitC, XIAO ESP32-S3, Arduino Nano ESP32. 48+ komponent, oʻrnatish yoʻq.',
      url: `${DOMAIN}/esp32-s3-simulator`,
    },
  },
  {
    path: '/esp32-c3-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul ESP32-C3 va RISC-V Simulyatori — Brauzer Asosidagi Emulyatsiya | Robo Mentor',
      description: 'ESP32-C3 RISC-V kodini toʻgʻridan-toʻgʻri brauzeringizda simulyatsiya qiling — backend kerak emas. 160 MHz da RV32IMC, 48+ komponent, Serial Monitor. CH32V003 ni ham qoʻllab-quvvatlaydi. Bepul va ochiq manba.',
      url: `${DOMAIN}/esp32-c3-simulator`,
    },
  },
  {
    path: '/raspberry-pi-pico-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul Raspberry Pi Pico Simulyatori — RP2040 ARM Cortex-M0+ Emulyatsiyasi | Robo Mentor',
      description: 'Raspberry Pi Pico va Pico W kodini bepul simulyatsiya qiling. rp2040js orqali 133 MHz da haqiqiy RP2040 ARM Cortex-M0+ emulyatsiyasi. 48+ komponent, Serial Monitor, Arduino-Pico yadrosi. Oʻrnatish yoʻq.',
      url: `${DOMAIN}/raspberry-pi-pico-simulator`,
    },
  },
  {
    path: '/raspberry-pi-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Bepul Raspberry Pi 3 Simulyatori — Brauzeringizda Toʻliq Linux Emulyatsiyasi | Robo Mentor',
      description: 'Raspberry Pi 3 ni bepul simulyatsiya qiling. QEMU orqali toʻliq ARM Cortex-A53 Linux emulyatsiyasi — brauzeringizda Python, bash, RPi.GPIO ni ishga tushiring. Raspberry Pi apparati kerak emas.',
      url: `${DOMAIN}/raspberry-pi-simulator`,
    },
  },

  // ── Reliz sahifalari
  {
    path: '/v2',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Robo Mentor 2.0 — Koʻp Platli Oʻrnatilgan Tizim Simulyatori | ESP32, Raspberry Pi, Arduino, RISC-V',
      description: 'Robo Mentor 2.0 taqdim etildi. Brauzeringizda Arduino, ESP32, Raspberry Pi Pico va Raspberry Pi 3 ni simulyatsiya qiling. 19 plata, 68+ misol, realistik datchik simulyatsiyasi. Bepul va ochiq manba.',
      url: `${DOMAIN}/v2`,
    },
  },

  // ── Loyiha haqida
  {
    path: '/about',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Robo Mentor Haqida — Ochiq Manbali Oʻrnatilgan Tizim Emulatori',
      description: 'Robo Mentor haqida bilib oling — bepul ochiq manbali koʻp platli oʻrnatilgan tizim emulatori. Dasturchilar, talabalar va robototexnika ixlosmandlari uchun yaratilgan.',
      url: `${DOMAIN}/about`,
    },
  },

  // ── Auth / admin (noindex — qidiruv tizimlaridan yashirish)
  { path: '/login',    noindex: true },
  { path: '/register', noindex: true },
  { path: '/admin',    noindex: true },
];
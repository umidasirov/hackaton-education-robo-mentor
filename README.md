<p align="center">
  <img src="https://img.shields.io/badge/🤖_RoboMentor-AI_Robototexnika_Platformasi-0071e3?style=for-the-badge&labelColor=141416" alt="RoboMentor" />
</p>

<h1 align="center">🤖 RoboMentor</h1>

<p align="center">
  <strong>AI yordamchili robototexnika o'rganish platformasi</strong><br/>
  <em>Hech qanday apparat kerak emas — brauzeringizda real vaqtda elektronika simulyatsiya qiling</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Groq_LLaMA-f97316?style=flat-square&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-VS_Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white" />
  <img src="https://img.shields.io/badge/Tillar-O'zbek_🇺🇿-34d399?style=flat-square" />
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-xususiyatlar">Xususiyatlar</a> •
  <a href="#-ai-texnologiyalari">AI</a> •
  <a href="#-arxitektura">Arxitektura</a> •
  <a href="#%EF%B8%8F-o'rnatish">O'rnatish</a> •
  <a href="#-vexio-open-source">Vexio</a>
</p>

---

## 🎬 Demo


<table>
<tr>
<td width="50%">

**📐 Vizual sxema qurish**
- Komponentlarni drag & drop bilan joylashtiring
- Simlarni sichqoncha bilan ulang
- AI real vaqtda tekshirib turadi

</td>
<td width="50%">

**🤖 AI Mentor**
- Sxemani tahlil qiladi
- Xatolarni topadi va tushuntiradi
- Bosqichma-bosqich yo'naltiradi

</td>
</tr>
</table>

---

## ✨ Xususiyatlar

### 🧠 AI Mentor (Intellektual yordamchi)
| Xususiyat | Tavsif |
|-----------|--------|
| 🔍 **Real vaqtli sxema tekshiruvi** | Kod yoki sim o'zgarganda AI avtomatik tahlil qiladi — panel ochiq bo'lmasa ham |
| ⚡ **Tinkercad uslubidagi chaqmoq** | Noto'g'ri ulangan komponent ustida chaqmoq belgisi chiqadi, bosilsa — muammo va yechim |
| 🎓 **O'rgatuvchi rejim (3 urinish)** | Xato topilganda darrov javob bermaydi — 3 bosqichda: ishora → maslahat → to'liq yechim + sabab |
| 💡 **Sxemaga asoslangan autocomplete** | Editorda kod yozayotganda AI sxemadagi pinlarga qarab kod taklif qiladi (ghost text) |
| 🚀 **Portlash/zarar tekshiruvi** | RUN bosilganda fizik xavflarni aniqlaydi: LED kuyishi, qisqa tutashuv, ortiqcha tok |
| 🌍 **To'liq o'zbek tilida** | Barcha javoblar, xabarlar va interfeys o'zbek tilida |

### 📐 Vizual simulyator
- **48+ interaktiv komponent** — LED, sensor, motor, displey va boshqalar
- **Arduino Uno, Nano, Mega, ESP32, RP2040** platalari
- **Real vaqtda kompilyatsiya** va AVR emulyatsiya
- **Serial Monitor** — dastur chiqishini ko'rish
- **Drag & drop** sxema qurish

### 📖 Interaktiv hujjatlar
- **Ishlash prinsipi** rasmlar bilan
- **Ulanish sxemasi** va **kod misollari**
- **"Simulyatorda ko'rish"** tugmasi — tayyor loyiha ochiladi
- **Video darsliklar** (YouTube havolalari)

### 🛠️ Loyihalar (Darslar)
- **Bosqichma-bosqich instruksiya** — kerakli detallar, ulanish, kod
- **Noldan yasash** — tayyor loyiha yuklanmaydi, user o'zi yasaydi
- **AI yo'naltirish** — loyiha kontekstini biladi, to'g'ri ketayaptimi tekshiradi
- **Kengaytirish** — loyiha tugagandan keyin ham AI yaxshilash g'oyalari beradi

---

## 🤖 AI texnologiyalari

RoboMentor **6 ta AI metod** orqali ishlaydi:

```
┌─────────────────────────────────────────────────────────┐
│                    🧠 AI Mentor                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 analyze_sketch    — Kodni to'g'rilik uchun tahlil   │
│  📚 explain_concept   — Tushunchani tushuntirish        │
│  🐛 debug_issue       — Xatolarni tuzatishda yordam     │
│  🔌 check_circuit     — Sxema + kod mosligini tekshiruv │
│  💡 code_suggest      — Sxemaga asoslangan autocomplete  │
│  🎓 guided_help       — 3 bosqichli o'rgatuvchi yordam  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Scan rejimi  │  │  RUN rejimi  │  │ Loyiha rejimi│   │
│  │ (8b model)   │  │ (70b model)  │  │ (kontekstli) │   │
│  │ Token tejash │  │ Chuqur tahlil│  │ Yo'naltirish │   │
│  └─────────────┘  └──────────────┘  └──────────────┘    │
│                                                         │
│  ⚡ Chaqmoq tizimi: danger / error / warning / info      │
│  🎯 O'rgatuvchi: ishora → maslahat → to'liq yechim      │
│  🔄 Real vaqtli: CircuitWatcher (fon kuzatuvchisi)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Ikki modelli arxitektura (token tejash)

| Vazifa | Model | Sabab |
|--------|-------|-------|
| Fon scan, autocomplete | `llama-3.1-8b-instant` | Tez, arzon, kunlik limitni tez tugatmaydi |
| Chat, debug, guided help | `llama-3.3-70b-versatile` | Chuqur tahlil, o'zbek tilida sifatli javob |

### AI ishlash oqimi

```
Foydalanuvchi kod yozadi / sim ulaydi
         │
         ▼
   CircuitWatcher (fon, 8s debounce)
         │
         ▼
   /api/ai-tutor/check-circuit (8b model)
         │
         ├── Muammo topildi? ──▶ ⚡ Chaqmoq belgisi (canvas)
         │                          │
         │                     Bosilsa ──▶ IssueModal
         │                          │
         │                     🎓 O'rgatuvchi rejim
         │                     1️⃣ Ishora (yechimni aytmaydi)
         │                     2️⃣ Kuchli maslahat
         │                     3️⃣ To'liq yechim + sabab
         │
         └── Hammasi to'g'ri? ──▶ ✅ (chaqmoq yo'q)

RUN bosilganda:
   /api/ai-tutor/check-circuit (mode=run, 70b)
         │
         └── Fizik zarar? ──▶ 💥 Portlash chaqmog'i
```

---

## 🏗️ Arxitektura

```
┌────────────────────────────────────────────────────────┐
│                     FRONTEND                           │
│                                                        │
│  React 18 + TypeScript + Vite + Zustand               │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Monaco Editor │  │  Simulator   │  │  AI Tutor   │  │
│  │ (kod yozish)  │  │  Canvas      │  │  Panel      │  │
│  │ + AI suggest  │  │ + IssueBadge │  │ + Markdown  │  │
│  │ + ghost text  │  │ + IssueModal │  │ + Notify    │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│          │                  │               │          │
│          ▼                  ▼               ▼          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              CircuitWatcher (fon)               │   │
│  │  Sxema + kod o'zgarsa → avtomatik AI scan       │   │
│  │  Panel ochiq-yopiq farqi yo'q                    │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                              │
└─────────────────────────│──────────────────────────────┘
                          │ REST API
┌─────────────────────────│──────────────────────────────┐
│                     BACKEND                            │
│                                                        │
│  FastAPI + Python 3.13 + SQLAlchemy                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              AI Tutor Service                    │  │
│  │  6 metod × 2 model (8b tez + 70b kuchli)        │  │
│  │  Groq API (LPU — juda tez inference)             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
│  │  Auth    │  │ Projects │  │ Arduino Compiler  │    │
│  │  (JWT)   │  │  (CRUD)  │  │  (arduino-cli)    │    │
│  └──────────┘  └──────────┘  └───────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ O'rnatish

### Talablar
- Node.js 18+
- Python 3.11+
- Groq API kaliti ([console.groq.com](https://console.groq.com))

### 1. Klonlash
```bash
git clone https://github.com/your-username/robomentor.git
cd robomentor
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .env faylini yarating
echo 'GROQ_API_KEY=gsk_sizning_kalitingiz' > .env

# Ishga tushirish
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Brauzer
```
http://localhost:5173
```

### Muhit o'zgaruvchilari

| O'zgaruvchi | Tavsif | Standart |
|-------------|--------|----------|
| `GROQ_API_KEY` | Groq API kaliti | — (shart) |
| `GROQ_MODEL` | Chat/debug uchun model | `llama-3.3-70b-versatile` |
| `GROQ_MODEL_FAST` | Fon scan uchun arzon model | `llama-3.1-8b-instant` |

---

## 📂 Loyiha tuzilishi

```
robomentor/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ai-tutor/          # 🧠 AI mentor paneli
│       │   │   ├── AITutorPanel   # Chat + maslahat
│       │   │   ├── CircuitWatcher # Fon kuzatuvchisi
│       │   │   ├── Markdown       # AI javobni render
│       │   │   └── NotificationModal
│       │   ├── editor/
│       │   │   └── CodeEditor     # Monaco + AI autocomplete
│       │   └── simulator/
│       │       ├── SimulatorCanvas # Vizual sxema
│       │       ├── IssueBadge     # ⚡ Chaqmoq belgisi
│       │       └── IssueModal     # O'rgatuvchi xato modali
│       ├── pages/
│       │   ├── DocsPage           # 📖 Hujjatlar (30+ bo'lim)
│       │   ├── ProjectsPage       # 🛠️ Loyihalar (darslar)
│       │   ├── ProjectDetailPage  # Bosqichma-bosqich instruksiya
│       │   └── EditorPage         # Asosiy editor sahifasi
│       ├── hooks/
│       │   └── useSmartCompletion # Sxemaga asoslangan autocomplete
│       ├── store/
│       │   ├── useCircuitIssuesStore  # AI aniqlagan xatolar
│       │   ├── useSimulatorStore      # Simulyator holati
│       │   └── useEditorStore         # Editor holati
│       └── data/
│           ├── docs-examples      # Hujjatlar uchun tayyor loyihalar
│           └── project-tutorials  # Loyiha instruksiyalari
│
└── backend/
    └── app/
        ├── services/
        │   └── ai_tutor.py        # 🧠 6 ta AI metod
        ├── api/routes/
        │   └── ai_tutor.py        # REST API endpointlar
        └── main.py                # FastAPI ilova
```

---

## 🎯 Foydalanish holatlari

### 👨‍🎓 Talaba uchun
1. **Loyihalar** sahifasidan "Aqlli damafon" ni tanlang
2. Instruksiyani o'qing — kerakli detallar, ulanish sxemasi
3. **"Editorga o'tish"** — bo'sh Arduino ochiladi
4. AI yo'naltirishi bilan bosqichma-bosqich yasang
5. Xato qilsangiz — chaqmoq chiqadi, 3 bosqichda o'rgatadi

### 👨‍🏫 O'qituvchi uchun
1. **Hujjatlar** — har komponent alohida sahifa, rasmlar, videolar
2. Talabalar mustaqil ishlaydi, AI nazorat qiladi
3. O'rgatuvchi rejim — talabaga darrov javob bermaydi, o'ylashga undaydi

---

## 🏆 Konkurs uchun

> **RoboMentor** — faqat simulyator emas, bu **AI bilan o'rganish tizimi**.

| Mezon | RoboMentor |
|-------|------------|
| **Innovatsiya** | AI real vaqtda sxemani kuzatadi va o'rgatadi (3 bosqichli pedagogik yondashuv) |
| **Foydalanuvchanlik** | O'zbek tilida, hech qanday apparat kerak emas, brauzerda ishlaydi |
| **Texnik murakkablik** | 6 ta AI metod, ikki modelli arxitektura, fon kuzatuvchi, Tinkercad uslubidagi chaqmoq tizimi |
| **Ta'lim qiymati** | Darrov javob bermaydi — talabani o'ylashga undaydi, xato sababini tushuntiradi |
| **Kengaytiruvchanlik** | Yangi komponent/loyiha qo'shish — faqat bitta fayl yozish |

---

## 💚 Vexio Open Source

<p align="center">
  <img src="https://img.shields.io/badge/❤️_Asoslangan-Vexio_Open_Source-22c55e?style=for-the-badge&labelColor=141416" />
</p>

RoboMentor **[Vexio](https://github.com/davidmonterocrespo24/vexio)** ochiq kodli loyihasi asosida qurilgan. Vexio — brauzerda ishlaydigan Arduino/ESP32 simulyator va emulyator bo'lib, **David Montero Crespo** tomonidan yaratilgan.

Biz Vexio ning ajoyib simulyator yadrosidan foydalanib, uning ustiga **AI o'rgatuvchi tizimini** qurdik:

| Vexio bergan | RoboMentor qo'shgan |
|-------------|---------------------|
| 🔧 AVR emulyator | 🧠 6 ta AI tutor metodi |
| 📐 Vizual sxema qurish | ⚡ Tinkercad uslubidagi chaqmoq tizimi |
| 💻 Monaco kod muharriri | 💡 Sxemaga asoslangan AI autocomplete |
| 📦 48+ komponent | 🎓 3 bosqichli o'rgatuvchi rejim |
| 🔄 Real vaqt simulyatsiya | 🤖 CircuitWatcher (fon AI kuzatuvchi) |
| | 📖 O'zbekcha interaktiv hujjatlar |
| | 🛠️ Bosqichma-bosqich loyiha darslari |

> 🙏 **Katta rahmat Vexio jamoasiga** ochiq kodli loyihani yaratganlari uchun!
> Sizning mehnatingiz tufayli biz O'zbekistonda robototexnika ta'limini
> yangi darajaga ko'tarish imkoniyatiga ega bo'ldik.
>
> Open source — bu shunchaki kod emas, bu **bilim almashish madaniyati**. 🌍

---

<p align="center">
  <strong>RoboMentor</strong> — robototexnikani o'rganishning eng oson yo'li 🚀
</p>

<p align="center">
  <em>O'zbekiston talabalari uchun, ❤️ bilan yaratildi</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🇺🇿_O'zbekiston-Robototexnika_ta'limi-0071e3?style=flat-square" />
</p>

"""
Velxio platformasi uchun AI Repetitor xizmati

Arduino kodlari va sxemalarini tahlil qiladi, tushuntiradi va xatolarni
topishda yordam beradi. Barcha javoblar O'ZBEK TILIDA beriladi.

Groq (OpenAI-mos API) va ochiq Llama modellari asosida ishlaydi.
"""

import os
from typing import Optional

from groq import Groq
from app.services.circuit_validator import CircuitValidator


# Ruxsat etilgan xavf darajalari
_VALID_SEVERITIES = ("danger", "error", "warning", "info")


def _norm_severity(value) -> str:
    """AI qaytargan severity ni normalizatsiya qiladi."""
    v = str(value or "").strip().lower()
    return v if v in _VALID_SEVERITIES else "warning"


class AITutorService:
    """Arduino sxemalari va kodi uchun AI yordamchi (o'zbek tilida)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """AI repetitorni Groq API bilan ishga tushiradi."""
        self.client = Groq(api_key=api_key)
        # Modelni GROQ_MODEL muhit o'zgaruvchisi orqali almashtirish mumkin.
        self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        # Tizim ko'rsatmasi (system prompt) - o'zbek tilida
        self.system_prompt = """Siz mikrokontroller dasturlash va sxema loyihalashni o'rganayotgan talabalar uchun tajribali Arduino va elektronika repetitorisiz.

MUHIM QOIDA: Har doim faqat O'ZBEK TILIDA javob bering. Texnik atamalarni o'zbekcha tushuntiring (kerak bo'lsa qavs ichida inglizcha atamani ham keltiring).

Sizning vazifangiz:
- Arduino kodi va sxemalarni to'g'rilik va eng yaxshi amaliyotlar bo'yicha tahlil qilish
- Xatolar, samarasizliklar va mumkin bo'lgan muammolarni aniqlash
- Kod NEGA shunday ishlashini oddiy so'zlar bilan tushuntirish
- Aniq tushuntirishlar bilan yaxshilanishlarni taklif qilish
- Talabalarni tushunchalar bo'yicha bosqichma-bosqich yo'naltirish
- Sabrli, ruhlantiruvchi va o'rgatuvchi bo'lish

Kodni tahlil qilishda:
1. Sintaksis va mantiqiy xatolarni tekshiring
2. Pin (oyoqcha) ulanishlari sxemaga mos kelishini tekshiring
3. Vaqt va chastota masalalarini ko'rib chiqing
4. Mumkin bo'lgan xotira/unumdorlik muammolarini tekshiring
5. O'quv jihatdan yaxshilanishlarni taklif qiling

Javob ko'rinishi:
- Qisqa holat bilan boshlang (\u2705 Yaxshi, \u26a0\ufe0f Ogohlantirish, \u274c Xato)
- Topilmalarni o'rgatuvchi tilda tushuntiring
- Aniq misollar keltiring
- Muammolarni qanday tuzatishni ko'rsating
- "Bu nega muhim" degan tushuntirishlar qo'shing

Har doim qo'llab-quvvatlovchi va o'rgatuvchi bo'ling, talaba kodini hech qachon mensimaslik bilan baholamang."""

    def _chat(self, prompt: str, max_tokens: int) -> dict:
        """Groq'ga bir martalik so'rov yuboradi va matn + token sonini qaytaradi."""
        completion = self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        text = completion.choices[0].message.content
        output_tokens = (
            completion.usage.completion_tokens if completion.usage else 0
        )
        return {"text": text, "output_tokens": output_tokens}

    async def analyze_sketch(
        self,
        code: str,
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
    ) -> dict:
        """
        Arduino kodi va sxemasini to'g'rilik va o'rganish imkoniyatlari bo'yicha tahlil qiladi.
        """
        # Sxema haqida kontekst yig'ish
        circuit_info = ""
        if components:
            circuit_info += "\n\nSxema komponentlari:\n"
            for comp in components:
                circuit_info += f"- {comp.get('type', 'Nomalum')}: {comp.get('id', '?')}\n"
                if comp.get('properties'):
                    circuit_info += f"  Xususiyatlari: {comp['properties']}\n"

        if connections:
            circuit_info += "\nUlanishlar:\n"
            for conn in connections:
                circuit_info += f"- {conn.get('from', '?')} \u2192 {conn.get('to', '?')}\n"

        # Tahlil so'rovi (o'zbekcha)
        analysis_prompt = f"""Iltimos, mikrokontroller dasturlashni o'rganayotgan talaba uchun ushbu Arduino kodini tahlil qiling:

{code}
{circuit_info}

Quyidagilarni bering (faqat o'zbek tilida):
1. **Holat**: Kod to'g'rimi? (\u2705 Yaxshi / \u26a0\ufe0f Muammolari bor / \u274c Ishlamaydi)
2. **Nima qiladi**: Kod nima qilmoqchi ekanligining qisqa tushuntirishi
3. **Topilgan muammolar**: Xatolar yoki muammolar (agar bo'lsa)
4. **Qanday tuzatish**: Bosqichma-bosqich tuzatishlar (agar muammo bo'lsa)
5. **Bu nega muhim**: Asosiy tushunchalarning o'quv tushuntirishi
6. **Yaxshilanishlar**: Yaxshiroq kod yozish bo'yicha takliflar
7. **Pin tekshiruvi**: Pin ulanishlari sxemaga mos keladimi?

Ruhlantiruvchi va o'rgatuvchi bo'ling. Texnik tushunchalarni aniq tushuntiring."""

        try:
            result = self._chat(analysis_prompt, max_tokens=1500)
            return {
                "success": True,
                "analysis": result["text"],
                "tokens_used": result["output_tokens"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis": None,
            }

    async def explain_concept(self, concept: str, context: str = "") -> dict:
        """
        Arduino/elektronika tushunchasini talabaga tushuntiradi.
        """
        prompt = f"""Mikrokontrollerlarni o'rganayotgan talabaga "{concept}" degan Arduino/elektronika tushunchasini tushuntiring.

Kontekst: {context if context else "Umumiy o'rganish"}

Quyidagilarni bering (faqat o'zbek tilida):
1. **Oddiy ta'rif**: Bu nima ekanligi oddiy tilda
2. **Qanday ishlaydi**: Bosqichma-bosqich tushuntirish
3. **Nega muhim**: Talabalar buni nega bilishi kerak
4. **Amaliy misol**: Haqiqiy Arduino kod misoli
5. **Keng tarqalgan xatolar**: Talabalar ko'pincha nimani noto'g'ri qiladi
6. **Buni sinab ko'ring**: Mashq qilish uchun oddiy topshiriq

Aniq, ruhlantiruvchi bo'ling va kerak bo'lsa o'xshatishlardan foydalaning."""

        try:
            result = self._chat(prompt, max_tokens=1200)
            return {
                "success": True,
                "explanation": result["text"],
                "concept": concept,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "explanation": None,
            }

    async def debug_issue(self, issue: str, code: str, error_message: str = "") -> dict:
        """
        Arduino kodidagi muayyan muammoni tuzatishda yordam beradi.
        """
        error_context = f"\nKompilyator xatosi: {error_message}" if error_message else ""

        debug_prompt = f"""Talabada Arduino kodi bilan quyidagi muammo bor:

Muammo: {issue}
{error_context}

Kod:
{code}

Quyidagicha tuzatishga yordam bering (faqat o'zbek tilida):
1. **Nima noto'g'ri ketmoqda**: Asosiy sababni aniqlang
2. **Nega shunday bo'ladi**: Asosida yotgan sababni tushuntiring
3. **Qanday tuzatish**: Tuzatilgan kodni bering
4. **Nega bu ishlaydi**: Tuzatishni tushuntiring
5. **Qanday oldini olish**: Kelajakda bundan qochish bo'yicha maslahatlar

Qo'llab-quvvatlovchi va o'rgatuvchi bo'ling. Bu o'rganish imkoniyati."""

        try:
            result = self._chat(debug_prompt, max_tokens=1500)
            return {
                "success": True,
                "help": result["text"],
                "issue": issue,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "help": None,
            }

    async def check_circuit(
        self,
        code: str,
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
        mode: str = "scan",
        project_context: str = "",
    ) -> dict:
        """
        Real vaqtda to'liq tekshiruv: kod + sxema + sim ulanishlari.

        Simlar to'g'ri ulanganmi, qaysi pinlar qayerga ulangan, kod bilan
        sxema mos keladimi - hammasini tekshiradi va chiroyli MARKDOWN
        formatda o'zbekcha javob qaytaradi.
        """
        # Komponentlar haqida batafsil ma'lumot
        comp_info = ""
        if components:
            comp_info += "\nSxemadagi komponentlar:\n"
            for comp in components:
                name = comp.get("type") or comp.get("metadataId") or "Nomalum"
                comp_info += f"- {name} (id: {comp.get('id', '?')})"
                props = comp.get("properties")
                if props:
                    comp_info += f", xususiyatlari: {props}"
                comp_info += "\n"
        else:
            comp_info += "\nSxemada hech qanday komponent yo'q.\n"

        # Sim ulanishlari - pin nomlari bilan (eng muhim qism)
        # YAXSHILANISH: Komponent tipini ham ko'rsata olamiz
        conn_info = ""
        comp_map = {c.get("id"): c for c in components} if components else {}
        
        if connections:
            conn_info += "\nSim ulanishlari (pin -> pin) with component types:\n"
            for conn in connections:
                frm_id = conn.get("from", "?")
                to_id = conn.get("to", "?")
                from_pin = conn.get("fromPin", "")
                to_pin = conn.get("toPin", "")
                
                # Component type info
                frm_type = ""
                to_type = ""
                if frm_id in comp_map:
                    frm_type = f"({comp_map[frm_id].get('type', 'unknown')})"
                if to_id in comp_map:
                    to_type = f"({comp_map[to_id].get('type', 'unknown')})"
                
                left = f"{frm_id}{frm_type}:{from_pin}" if from_pin else f"{frm_id}{frm_type}"
                right = f"{to_id}{to_type}:{to_pin}" if to_pin else f"{to_id}{to_type}"
                conn_info += f"- {left}  →  {right}\n"
        else:
            conn_info += "\nHech qanday sim ulanmagan.\n"

        # Pre-validate circuit to avoid false positives
        validation_result = CircuitValidator.validate_circuit(components, connections)
        pre_check_info = ""
        if validation_result["has_obvious_issues"]:
            pre_check_info = "\n⚠️ OLI TEKSHIRUV: Quyidagi muammolar topildi:\n"
            for issue in validation_result["issues"]:
                pre_check_info += f"- {issue}\n"
            pre_check_info += "\nBU MUAMMOLARNI BILANTIRING. Qolgan talaffuzga AI diqqat beradi.\n"

        # Rejimga qarab ko'rsatma: 'run' = fizik zarar, 'scan' = maslahat
        if mode == "run":
            mode_instructions = """BU SIMULYATSIYA ISHGA TUSHIRILGANDA (RUN) tekshiruvi. Faqat FIZIK ZARAR va XAVFlarni toping:
- Komponent KUYIB ketishi (masalan LED rezistorsiz to'g'ridan-to'g'ri 5V pinga ulangan)
- QISQA TUTASHUV (VCC va GND to'g'ridan-to'g'ri ulangan)
- Noto'g'ri KUCHLANISH (komponentga juda baland kuchlanish berilgan)
- Teskari POLYARLIK (komponent teskari ulangan, ishlamaydi yoki kuyadi)
- Ortiqcha TOK (motor/servo to'g'ridan-to'g'ri pinga ulangan, board zararlanadi)

Agar fizik zarar bo'lsa severity = "danger". Agar ishlamaydigan lekin zararsiz bo'lsa "error".
Agar hammasi xavfsiz bo'lsa - bo'sh ro'yxat qaytaring."""
            sections = """## Simulyatsiya xavfsizligi
(✅ Xavfsiz / ⚠️ Ehtiyot bo'ling / 💥 ZARAR XAVFI bor)

## Aniqlangan xavflar
(Har bir fizik xavf: qaysi komponent, nima bo'ladi - kuyadimi, portlaydimi, zararlanadimi.)

## Nega bu xavfli
(Fizik sabab: tok, kuchlanish, qarshilik haqida oddiy tushuntirish.)

## Qanday tuzatish
(Aniq yechim. Kerak bo'lsa to'g'rilangan kod yoki ulanish.)"""
        else:
            mode_instructions = """BU sxemani TEKSHIRISH (scan) rejimi. Ulanishlar to'g'rimi, kod sxemaga mos keladimi - maslahat bering. Bu hali ishga tushirilmagan, shuning uchun "kuyadi/portlaydi" demang - faqat "ulanmagan", "mos kelmaydi", "yaxshilash mumkin" kabi maslahatlar."""
            sections = """## Umumiy holat
(✅ Hammasi joyida / ⚠️ Ogohlantirishlar bor / ❌ Xatolar bor)

## Sim ulanishlari tekshiruvi
(Har bir muhim ulanish to'g'rimi. Masalan: ✅ LED anodi 13-pinga ulangan, yoki ❌ Rezistor ulanmagan. Aniq komponent va pin nomini ayting.)

## Kod va sxema mosligi
(Koddagi pinlar sxemaga mos keladimi?)

## Topilgan muammolar
(Har birini: NIMA, QAYERDA (komponent/pin), NEGA.)

## Qanday tuzatish
(Aniq yechim. Kerak bo'lsa ```cpp ... ``` kod bloki.)

## Maslahatlar
(Kelajakda qanday qochish mumkin.)"""

        # Loyiha konteksti mavjud bo'lsa, prompt ga qo'shish
        project_hint = ""
        if project_context:
            project_hint = f"""
LOYIHA KONTEKSTI: Talaba quyidagi loyiha ustida ishlayapti:
{project_context}
Shu loyiha maqsadiga qarab tekshiring va maslahat bering. Agar talaba hali boshlamagan bo'lsa, birinchi qadamni ko'rsating.
Agar to'g'ri yo'lda bo'lsa, keyingi qadamni taklif qiling. Hammasi tayyor bo'lsa, tabrik qiling va kengaytirish g'oyalarini bering.
"""

        prompt = f"""{project_hint}
Quyida talabaning Arduino loyihasi bor. Kod (code editor) va sxema (canvas simulyator) ma'lumotini birgalikda tahlil qiling.

=== KOD ===
{code}

=== SXEMA ===
{comp_info}
{conn_info}{pre_check_info}

{mode_instructions}

MUHIM OQIBAT: Agar sxemada rezistor yoki boshqa himoya komponentlari ulangan bo'lsa - bu XAVFSIZ demakdir! Faqat haqiqiy elektr xavflari haqida ogohlantiringiz (qisqa tutashuv, rezistorsiz LED 5V ga, teskari polyarlik).

Javobni QAT'IY quyidagi MARKDOWN formatida, faqat o'zbek tilida bering:

{sections}

MUHIM: Markdown sarlavhalar (##), ro'yxatlar (-) va kod bloklaridan (```) foydalaning.

=== QO'SHIMCHA: STRUKTURALANGAN MUAMMOLAR ===
Markdown hisobotdan keyin, ALOHIDA bir qatorda quyidagi JSON ni qaytaring (chaqmoq belgilari uchun). 

DIQQAT - YALG'ISHI KERAK:
1. Faqat HAQIQIY va ANIQ muammolarni kiritingiz. Shuboha muammolar yo'q!
2. Rezistor bo'lsa - LED xavfsiz demak, xavf ogohlantirishi yo'q!
3. Har bir muammoda aniq componentId va pin nomi bo'lsin
4. Severityni juda oqilona belgilang - barcha ogohlantirish "danger" bo'lmasligi kerak

Har bir obyektda:
- "componentId": sxemadagi aniq id
- "pin": muammoli pin nomi yoki raqami
- "severity": "danger" yoki "error" yoki "warning"
- "message": qisqa o'zbekcha - bu yerda nima muammo
- "why": qisqa o'zbekcha - nega bu muammo (fizik/mantiqiy sabab)
- "fix": asosiy tavsiya etilgan yechim (qisqa o'zbekcha)
- "options": 2-3 ta turli yechim varianti massivi (har biri qisqa o'zbekcha jumla)

Format QAT'IY shunday (boshqa matn yo'q):

<<<ISSUES>>>
[{{"componentId": "led-1", "pin": "anode", "severity": "danger", "message": "LED rezistorsiz ulangan", "why": "Cheklovchi rezistor yo'q, ortiqcha tok LEDni kuydiradi", "fix": "Anod va pin orasiga 220Ω rezistor qo'ying", "options": ["220Ω rezistorni anod ketma-ket ulang", "330Ω rezistor ham ishlaydi (biroz xira)", "PWM bilan tokni kamaytiring"]}}]
<<<END>>>

Agar muammo bo'lmasa: <<<ISSUES>>>[]<<<END>>>"""

        try:
            result = self._chat(prompt, max_tokens=1800)
            raw = result["text"]

            # Strukturalangan xatolarni (chaqmoq belgilari uchun) ajratib olish
            report, issues = self._extract_issues(raw)

            return {
                "success": True,
                "report": report,
                "issues": issues,
                "tokens_used": result["output_tokens"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "report": None,
                "issues": [],
            }

    @staticmethod
    def _extract_issues(raw: str):
        """
        Javobdan <<<ISSUES>>>...<<<END>>> bloki ichidagi JSON ni ajratadi.
        Markdown hisobotni (issues blokisiz) va issues ro'yxatini qaytaradi.
        """
        import json
        import re

        issues = []
        report = raw

        match = re.search(r"<<<ISSUES>>>(.*?)<<<END>>>", raw, re.DOTALL)
        if match:
            # Hisobotdan issues blokini olib tashlash
            report = raw[: match.start()].strip()
            json_text = match.group(1).strip()
            try:
                parsed = json.loads(json_text)
                if isinstance(parsed, list):
                    for it in parsed:
                        if not isinstance(it, dict):
                            continue
                        issues.append({
                            "componentId": str(it.get("componentId", "")),
                            "pin": str(it.get("pin", "")),
                            "severity": _norm_severity(it.get("severity")),
                            "message": str(it.get("message", "")),
                            "why": str(it.get("why", "")),
                            "fix": str(it.get("fix", "")),
                            "options": [
                                str(o) for o in it.get("options", [])
                                if isinstance(it.get("options"), list)
                            ],
                        })
            except (json.JSONDecodeError, ValueError):
                # JSON buzilgan bo'lsa - jim, faqat hisobotni qaytaramiz
                pass

        return report, issues

    async def code_suggest(
        self,
        code_before: str,
        code_after: str = "",
        language: str = "cpp",
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
    ) -> dict:
        """
        Sxemaga qarab fikrlaydigan kod taklifi (inline autocomplete).

        Oddiy autocomplete emas - canvas'dagi komponentlar va sim ulanishlarini
        hisobga olib, kursor o'rniga mos kod parchasini taklif qiladi.
        Masalan, LED 13-pinga ulangan bo'lsa, pinMode(13, OUTPUT) ni taklif qiladi.

        Faqat qo'shiladigan kod matnini qaytaradi (tushuntirishsiz).
        """
        # Sxema kontekstini qisqa va aniq tuzish
        circuit_lines = []
        if components:
            for comp in components:
                name = comp.get("type") or comp.get("metadataId") or "?"
                props = comp.get("properties") or {}
                pin = props.get("pin")
                extra = f" (pin={pin})" if pin is not None else ""
                circuit_lines.append(f"{name}{extra}")
        comp_summary = ", ".join(circuit_lines) if circuit_lines else "yo'q"

        conn_lines = []
        if connections:
            for conn in connections:
                frm = conn.get("from", "?")
                to = conn.get("to", "?")
                fp = conn.get("fromPin", "")
                tp = conn.get("toPin", "")
                left = f"{frm}:{fp}" if fp else str(frm)
                right = f"{to}:{tp}" if tp else str(to)
                conn_lines.append(f"{left}->{right}")
        conn_summary = "; ".join(conn_lines) if conn_lines else "yo'q"

        system = (
            "You are a smart inline code completion engine for Arduino/microcontroller code. "
            "You see the user's circuit (components and wire connections with pin names) and complete "
            "the code accordingly. Use the ACTUAL pin numbers from the wiring. "
            "Return ONLY the raw code that should be inserted at the cursor - no explanations, "
            "no markdown, no code fences, no comments unless they help. Keep it short and correct. "
            "If nothing useful can be suggested, return an empty string."
        )

        user = f"""Language: {language}
Circuit components: {comp_summary}
Wire connections (pin to pin): {conn_summary}

Code before cursor:
{code_before}

Code after cursor:
{code_after}

Complete the code at the cursor position. Use the real pins from the wiring above.
Return ONLY the text to insert (no explanation, no fences):"""

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                max_tokens=160,
                temperature=0.2,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
            text = completion.choices[0].message.content or ""
            # Kod bloklari belgilarini tozalash (model ba'zan qo'shadi)
            text = text.strip()
            if text.startswith("```"):
                # birinchi qatorni (```lang) va oxirgi ``` ni olib tashlash
                lines = text.split("\n")
                if lines and lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip().startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines)

            return {"success": True, "suggestion": text}

        except Exception as e:
            return {"success": False, "error": str(e), "suggestion": ""}

    async def guided_help(
        self,
        problem: str,
        attempt: int = 1,
        code: str = "",
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
        where: str = "",
    ) -> dict:
        """
        Bosqichli o'rgatuvchi yordam (pedagogik scaffolding).

        Foydalanuvchiga muammoni o'zi tuzatishga 3 urinish beriladi:
          - attempt 1: faqat ISHORA (qayerga qarash kerak, yechimni aytmaydi)
          - attempt 2: KUCHLIROQ maslahat (deyarli yechim, lekin o'zi yozsin)
          - attempt 3+: TO'LIQ yechim + chuqur "nega" + qaytarmaslik darslari

        Muammo kodda yoki sxemada bo'lishidan qat'i nazar bir xil ishlaydi.
        """
        # Kontekst yig'ish
        circuit = ""
        if components:
            circuit += "\nKomponentlar: " + ", ".join(
                f"{c.get('type') or c.get('metadataId') or '?'}(id:{c.get('id','?')})"
                for c in components
            )
        if connections:
            circuit += "\nUlanishlar: " + "; ".join(
                f"{c.get('from','?')}:{c.get('fromPin','')}->{c.get('to','?')}:{c.get('toPin','')}"
                for c in connections
            )

        where_line = f"\nMuammo joyi: {where}" if where else ""

        if attempt <= 1:
            stage = """BU 1-URINISH. Talaba muammoni O'ZI topib tuzatishi kerak - bu o'rganish uchun muhim.
QOIDA: To'liq yechimni BERMANG! Faqat ISHORA bering - qayerga qarash kerakligini ko'rsating.
Savol bilan yo'naltiring (masalan "13-pinga nima ulangan? Koddagi pin bilan solishtir").
Talabani o'ylashga undang. Yechimni oshkor qilmang."""
            sections = """## 💡 Ishora
(Qayerga qarash kerakligini ko'rsating - lekin yechimni aytmang. Savol bilan yo'naltiring.)

## 🤔 O'zingizdan so'rang
(2-3 ta yo'naltiruvchi savol, talaba o'zi javob topishi uchun.)

## ➡️ Keyingi qadam
(Hozir nima tekshirishni ayting - "ko'rib chiqing va yana sinab ko'ring".)"""
        elif attempt == 2:
            stage = """BU 2-URINISH. Talaba hali tuzata olmadi. Endi KUCHLIROQ yordam bering.
QOIDA: Muammo aniq QAYERDA ekanligini ayting va deyarli yechimni ko'rsating,
LEKIN oxirgi qadamni (aniq kodni/ulanishni) talaba o'zi qilsin. Biroz qoldiring."""
            sections = """## 📍 Muammo aniq qayerda
(Aniq qator/komponent/pin ni ko'rsating.)

## 🔧 Deyarli yechim
(Nima qilish kerakligini aniq ayting, lekin to'liq kodni bermang - yo'nalishni ko'rsating.)

## ➡️ Endi siz
(Talaba qanday yakunlashini ayting.)"""
        else:
            stage = """BU 3-URINISH (oxirgi). Talaba 2 marta uringan. Endi TO'LIQ yordam bering.
QOIDA: To'liq yechimni bering, ANIQ tushuntiring, va eng muhimi - talaba bu xatoni
QAYTA QILMASLIGI uchun chuqur o'rgating. Sabab va oldini olishga urg'u bering."""
            sections = """## ✅ To'liq yechim
(Aniq nima qilish kerak. To'g'rilangan kodni ```cpp ... ``` blokida yoki aniq ulanishni bering.)

## 🧠 Bu xato nega kelib chiqdi
(Asosiy sababni chuqur tushuntiring - fizik yoki mantiqiy. Talaba tushunsin.)

## 🛡️ Qanday qaytarmaslik kerak
(Kelajakda bu xatoni oldini olish uchun aniq qoida/odat. Eslab qolsin.)

## 📚 Asosiy dars
(Bitta jumlada: bu vaziyatdan olinadigan asosiy saboq.)"""

        prompt = f"""Talaba Arduino loyihasida muammoga duch keldi va yordam so'rayapti.

Muammo: {problem}{where_line}
{f"Kod:{chr(10)}{code}" if code else ""}{circuit}

{stage}

Javobni faqat O'ZBEK TILIDA, quyidagi MARKDOWN formatida bering:

{sections}

Iliq, ruhlantiruvchi va sabrli bo'ling. Talaba o'rganayotganini unutmang."""

        try:
            result = self._chat(prompt, max_tokens=1200)
            is_final = attempt >= 3
            return {
                "success": True,
                "help": result["text"],
                "attempt": attempt,
                "is_final": is_final,
                "attempts_left": max(0, 3 - attempt),
            }
        except Exception as e:
            return {"success": False, "error": str(e), "help": None}

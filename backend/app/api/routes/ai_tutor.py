"""
AI Tutor Routes

Endpoints for AI-powered educational assistance with code analysis, 
concept explanation, and debugging help.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_tutor import AITutorService
from app.core.config import settings

router = APIRouter(prefix="/api/ai-tutor", tags=["ai-tutor"])

# Initialize the AI tutor service
GROQ_API_KEY = settings.GROQ_API_KEY
ai_tutor = AITutorService(api_key=GROQ_API_KEY or None)


class SketchAnalysisRequest(BaseModel):
    """Request to analyze an Arduino sketch."""
    code: str
    components: list[dict] = []
    connections: list[dict] = []


class ConceptExplanationRequest(BaseModel):
    """Request to explain a concept."""
    concept: str
    context: str = ""


class DebugIssueRequest(BaseModel):
    """Request to help debug an issue."""
    issue: str
    code: str
    error_message: str = ""


class CircuitCheckRequest(BaseModel):
    """Real vaqtdagi to'liq tekshiruv so'rovi: kod + komponentlar + simlar."""
    code: str
    components: list[dict] = []
    connections: list[dict] = []
    mode: str = "scan"  # "scan" = maslahat, "run" = fizik zarar tekshiruvi
    project_context: str = ""  # Loyiha konteksti (AI loyiha bo'yicha yo'naltiradi)


class CodeSuggestRequest(BaseModel):
    """Sxemaga qarab fikrlaydigan inline kod taklifi so'rovi."""
    code_before: str
    code_after: str = ""
    language: str = "cpp"
    components: list[dict] = []
    connections: list[dict] = []


class GuidedHelpRequest(BaseModel):
    """Bosqichli o'rgatuvchi yordam so'rovi (3 urinishli scaffolding)."""
    problem: str
    attempt: int = 1
    code: str = ""
    components: list[dict] = []
    connections: list[dict] = []
    where: str = ""


@router.post("/analyze-sketch")
async def analyze_sketch(request: SketchAnalysisRequest):
    """
    Analyze an Arduino sketch for correctness, issues, and learning opportunities.
    
    Returns detailed feedback with explanations suitable for educational contexts.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Kod bo'sh bo'lishi mumkin emas")
    
    if not GROQ_API_KEY:
        return {
            "success": False,
            "error": "AI repetitor sozlanmagan (GROQ_API_KEY o'rnatilmagan)",
            "analysis": "AI repetitordan foydalanish uchun GROQ_API_KEY muhit o'zgaruvchisini sozlang."
        }
    
    result = await ai_tutor.analyze_sketch(
        code=request.code,
        components=request.components,
        connections=request.connections,
    )
    
    return result


@router.post("/explain-concept")
async def explain_concept(request: ConceptExplanationRequest):
    """
    Get an explanation of an Arduino/electronics concept from the AI tutor.
    
    Provides educational explanations with examples and practice exercises.
    """
    if not request.concept.strip():
        raise HTTPException(status_code=400, detail="Tushuncha nomi bo'sh bo'lishi mumkin emas")
    
    if not GROQ_API_KEY:
        return {
            "success": False,
            "error": "AI repetitor sozlanmagan",
            "explanation": "GROQ_API_KEY muhit o'zgaruvchisini sozlang."
        }
    
    result = await ai_tutor.explain_concept(
        concept=request.concept,
        context=request.context,
    )
    
    return result


@router.post("/debug-issue")
async def debug_issue(request: DebugIssueRequest):
    """
    Get help debugging an issue with Arduino code.
    
    Provides step-by-step debugging guidance suitable for students.
    """
    if not request.code.strip() or not request.issue.strip():
        raise HTTPException(status_code=400, detail="Kod va muammo tavsifi talab qilinadi")
    
    if not GROQ_API_KEY:
        return {
            "success": False,
            "error": "AI repetitor sozlanmagan",
            "help": "GROQ_API_KEY muhit o'zgaruvchisini sozlang."
        }
    
    result = await ai_tutor.debug_issue(
        issue=request.issue,
        code=request.code,
        error_message=request.error_message,
    )
    
    return result


@router.post("/check-circuit")
async def check_circuit(request: CircuitCheckRequest):
    """
    Real vaqtda to'liq tekshiruv: kod + sxema + sim ulanishlari.

    Code editor va canvas simulyator ma'lumotini birgalikda tahlil qiladi,
    simlar to'g'ri ulanganmi tekshiradi va chiroyli markdown formatda
    o'zbekcha hisobot qaytaradi.
    """
    if not request.code.strip() and not request.components and not request.connections:
        return {
            "success": False,
            "error": "Tekshirish uchun kod yoki sxema kerak",
            "report": "Avval kod yozing yoki sxemaga komponent qo'shing.",
        }

    if not GROQ_API_KEY:
        return {
            "success": False,
            "error": "AI repetitor sozlanmagan (GROQ_API_KEY o'rnatilmagan)",
            "report": "AI repetitordan foydalanish uchun GROQ_API_KEY muhit o'zgaruvchisini sozlang.",
        }

    result = await ai_tutor.check_circuit(
        code=request.code,
        components=request.components,
        connections=request.connections,
        mode=request.mode,
        project_context=request.project_context,
    )

    return result


@router.post("/code-suggest")
async def code_suggest(request: CodeSuggestRequest):
    """
    Sxemaga qarab fikrlaydigan inline kod taklifi (smart autocomplete).

    Editorda kod yozilayotganda canvas'dagi komponentlar va sim ulanishlarini
    hisobga olib, kursor o'rniga mos keladigan kod parchasini taklif qiladi.
    Tezlik uchun AI sozlanmagan bo'lsa jimgina bo'sh taklif qaytaradi.
    """
    if not GROQ_API_KEY:
        # Autocomplete - jim rejimda, modal/xato chiqarmaydi
        return {"success": False, "suggestion": ""}

    if not request.code_before.strip():
        return {"success": True, "suggestion": ""}

    result = await ai_tutor.code_suggest(
        code_before=request.code_before,
        code_after=request.code_after,
        language=request.language,
        components=request.components,
        connections=request.connections,
    )

    return result


@router.post("/guided-help")
async def guided_help(request: GuidedHelpRequest):
    """
    Bosqichli o'rgatuvchi yordam (pedagogik scaffolding).

    Talabaga muammoni o'zi tuzatishga 3 urinish beriladi:
      - 1-urinish: faqat ishora
      - 2-urinish: kuchliroq maslahat
      - 3-urinish: to'liq yechim + nega + qaytarmaslik darslari

    Muammo kodda yoki sxemada bo'lishidan qat'i nazar ishlaydi.
    """
    if not request.problem.strip():
        return {"success": False, "error": "Muammo tavsifi kerak", "help": None}

    if not GROQ_API_KEY:
        return {
            "success": False,
            "error": "AI repetitor sozlanmagan (GROQ_API_KEY o'rnatilmagan)",
            "help": "GROQ_API_KEY muhit o'zgaruvchisini sozlang.",
        }

    result = await ai_tutor.guided_help(
        problem=request.problem,
        attempt=request.attempt,
        code=request.code,
        components=request.components,
        connections=request.connections,
        where=request.where,
    )
    return result


@router.get("/status")
async def tutor_status():
    """Check if the AI tutor service is available and configured."""
    return {
        "available": bool(GROQ_API_KEY),
        "status": "ready" if GROQ_API_KEY else "not-configured",
        "message": "AI repetitor talabalarga yordam berishga tayyor" if GROQ_API_KEY else "AI repetitorni yoqish uchun GROQ_API_KEY o'rnating",
    }

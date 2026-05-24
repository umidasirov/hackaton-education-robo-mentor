# 🤖 AI Tutor Integration — Complete Setup Guide

## What Was Built

The **AI Tutor** is now integrated into Velxio as an intelligent educational assistant for General Education learners. It provides:

### ✅ Three Main Features:

1. **Sketch Analysis** — Analyze Arduino code for correctness and improvements
2. **Concept Explanations** — Learn electronics and Arduino concepts with examples
3. **Debugging Help** — Get step-by-step assistance fixing code issues

---

## Installation Summary

### Backend Components ✅
- [x] `app/services/ai_tutor.py` — AI service using Claude API
- [x] `app/api/routes/ai_tutor.py` — API endpoints
- [x] Integration in `app/main.py`
- [x] `anthropic>=0.25.0` added to requirements.txt and installed

### Frontend Components ✅
- [x] `components/ai-tutor/AITutorPanel.tsx` — Chat UI component
- [x] `components/ai-tutor/AITutorPanel.css` — Styling
- [x] Integration in `pages/EditorPage.tsx`
- [x] Dependencies installed (@xterm packages)

### Documentation ✅
- [x] `docs/AI_TUTOR.md` — Complete user and developer guide

---

## 🚀 Quick Start

### 1. Get an API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account (free tier available)
3. Generate an API key

### 2. Set Environment Variable
**Linux/Mac:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-...
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Restart Backend
```bash
cd /home/umid/Videos/velxio1201/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

### 4. Start Frontend
```bash
cd /home/umid/Videos/velxio1201/frontend
npm run dev
```

---

## 📋 API Endpoints

All endpoints return JSON with `success`, `analysis/explanation/help`, and optional `error` fields.

### Check Status
```bash
curl http://localhost:8001/api/ai-tutor/status
```

### Analyze Sketch
```bash
curl -X POST http://localhost:8001/api/ai-tutor/analyze-sketch \
  -H "Content-Type: application/json" \
  -d '{
    "code": "void setup() { Serial.begin(9600); }",
    "components": [],
    "connections": []
  }'
```

### Explain Concept
```bash
curl -X POST http://localhost:8001/api/ai-tutor/explain-concept \
  -H "Content-Type: application/json" \
  -d '{
    "concept": "PWM",
    "context": ""
  }'
```

### Debug Issue
```bash
curl -X POST http://localhost:8001/api/ai-tutor/debug-issue \
  -H "Content-Type: application/json" \
  -d '{
    "issue": "LED not blinking",
    "code": "void setup() { pinMode(13, OUTPUT); }",
    "error_message": ""
  }'
```

---

## 💬 User Commands

In the AI Tutor chat, users can:

| Command | Purpose |
|---------|---------|
| `/analyze` | Analyze current sketch |
| `/explain PWM` | Learn about PWM |
| `/debug LED issue` | Get debugging help |
| Free text | Ask any question |

---

## 🎓 Educational Features

The AI Tutor is specifically designed for **General Education**:

✅ **Student-Friendly Language** — Simple explanations, not technical jargon  
✅ **Educational Feedback** — Explains WHY code works, not just WHAT  
✅ **Practical Examples** — Real Arduino code in responses  
✅ **Encouraging Tone** — Supportive, celebrates progress  
✅ **Hands-On Learning** — Suggests exercises and practice

---

## 📊 Architecture

```
Frontend (React)
    ↓
    → AITutorPanel.tsx (UI Chat)
    ↓
FastAPI Backend
    ↓
    → /api/ai-tutor/* (REST Endpoints)
    ↓
    → app/services/ai_tutor.py (Business Logic)
    ↓
Anthropic Claude API
    ↓
    → AI Analysis & Explanations
```

---

## 🔧 Configuration Options

### In `app/services/ai_tutor.py`:

```python
# Change AI model (if newer version available)
self.model = "claude-3-5-sonnet-20241022"

# Adjust response length (max_tokens)
message = self.client.messages.create(
    max_tokens=1500,  # Increase for longer responses
    ...
)
```

---

## 💡 Example Use Cases

### Student Learning PWM
```
Student: /explain PWM
AI: Explains PWM concept, provides code example, suggests exercise
```

### Debugging LED Code
```
Student: /debug My LED code doesn't work
AI: Identifies issue, explains why, provides fix, prevents future bugs
```

### Code Review
```
Student: /analyze
AI: Reviews sketch, suggests improvements, explains best practices
```

---

## ⚙️ For Administrators

### Check Service Health
```bash
curl http://localhost:8001/api/ai-tutor/status
```

Expected response when configured:
```json
{
  "available": true,
  "status": "ready",
  "message": "AI tutor is ready to help students"
}
```

### Monitor Usage
Track API calls via Anthropic dashboard at [console.anthropic.com](https://console.anthropic.com)

### Set Usage Limits
Create `.env` file in backend with:
```
ANTHROPIC_API_KEY=sk-ant-...
MAX_TOKENS_PER_REQUEST=2000
```

---

## 🛠️ Troubleshooting

### "AI Tutor not configured"
- Set `ANTHROPIC_API_KEY` environment variable
- Restart the backend
- Check `/api/ai-tutor/status` endpoint

### Response takes too long
- Large sketches (>10KB) may be slow
- Complex questions may need more processing time
- Try breaking code into smaller pieces

### "Invalid API Key"
- Verify key at [console.anthropic.com](https://console.anthropic.com)
- Ensure it starts with `sk-ant-`
- No spaces or extra characters

### Backend errors
- Check backend logs for detailed errors
- Verify anthropic package: `pip list | grep anthropic`
- Reinstall if needed: `pip install --upgrade anthropic`

---

## 📈 Monitoring & Analytics

### Log Query Types
Add to `app/services/ai_tutor.py`:
```python
print(f"Query type: {request_type}, Tokens: {response.usage.output_tokens}")
```

### Track Student Learning
Students can save tutor conversations by copying/pasting

---

## 🔐 Security Notes

- API key should NEVER be committed to git
- Use environment variables in production
- Requests go directly to Anthropic (no Velxio servers store data)
- CORS already configured for frontend

---

## 📚 Next Steps

1. **[Required] Get API Key** — Visit [console.anthropic.com](https://console.anthropic.com)
2. **[Required] Set Environment Variable** — Add ANTHROPIC_API_KEY
3. **[Recommended] Test in UI** — Click 🤖 button and try /analyze
4. **[Optional] Customize** — Adjust system prompts for your curriculum
5. **[Optional] Monitor** — Track usage in Anthropic dashboard

---

## ✨ Files Created/Modified

### New Files
- `backend/app/services/ai_tutor.py`
- `backend/app/api/routes/ai_tutor.py`
- `frontend/src/components/ai-tutor/AITutorPanel.tsx`
- `frontend/src/components/ai-tutor/AITutorPanel.css`
- `docs/AI_TUTOR.md`
- `docs/SETUP_AI_TUTOR.md` (this file)

### Modified Files
- `backend/app/main.py` — Added AI tutor router
- `backend/requirements.txt` — Added anthropic package
- `frontend/src/pages/EditorPage.tsx` — Added AI tutor component
- `frontend/package.json` — Dependencies already satisfied

---

## 🎯 Success Checklist

- [ ] API key obtained from Anthropic
- [ ] `ANTHROPIC_API_KEY` environment variable set
- [ ] Backend restarted with uvicorn
- [ ] Frontend running with npm run dev
- [ ] 🤖 button visible in bottom-right corner
- [ ] `/api/ai-tutor/status` returns `available: true`
- [ ] Test `/analyze` command on a sketch
- [ ] Read `docs/AI_TUTOR.md` for full feature guide

---

## 📞 Support

For issues or questions:
1. Check `docs/AI_TUTOR.md` FAQ
2. Review this setup guide
3. Check backend logs for errors
4. Verify API key is valid

---

**Your AI Tutor is ready to help students learn! 🚀**

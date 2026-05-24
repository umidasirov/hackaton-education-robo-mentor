# AI Tutor — Educational Assistant for Velxio

The **AI Tutor** is an intelligent educational assistant integrated into the Velxio platform to help students learn Arduino programming and circuit design. It provides:

✅ **Code Analysis** — Verify sketch correctness and identify issues  
✅ **Concept Explanations** — Learn Arduino and electronics concepts  
✅ **Debugging Help** — Get step-by-step guidance for fixing code  
✅ **Educational Feedback** — Learn WHY code works and best practices  

## Features

### 1. **Sketch Analysis** 📊
Analyze your entire Arduino sketch and circuit for:
- Syntax and logic errors
- Pin assignments matching the circuit
- Timing and frequency issues
- Memory/performance concerns
- Educational improvements

### 2. **Concept Learning** 📚
Get clear explanations with examples:
- PWM (Pulse Width Modulation)
- Serial communication
- Interrupts and timers
- I2C/SPI protocols
- GPIO and pin control
- And more!

### 3. **Debugging Assistance** 🐛
Get help fixing issues:
- Root cause identification
- Step-by-step solutions
- Why the fix works
- How to prevent similar issues

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Key
Set the `ANTHROPIC_API_KEY` environment variable:

**Linux/Mac:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

**Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=your-api-key-here
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

**Docker:**
Add to your `docker-compose.yml`:
```yaml
environment:
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

### 3. Restart Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

The AI Tutor will be available in the frontend when you see the purple chat button in the bottom-right corner.

## How to Use

### From the UI
1. Click the **🤖 AI Tutor** button (bottom-right)
2. Choose from suggested actions or type your question
3. Use the quick commands below

### Commands

| Command | Usage | Example |
|---------|-------|---------|
| `/analyze` | Analyze current sketch | `/analyze` |
| `/explain` | Explain a concept | `/explain PWM` |
| `/debug` | Get debugging help | `/debug LED not blinking` |
| Free text | Ask any question | `How do I use interrupts?` |

### Example Workflows

**Analyzing a Sketch:**
```
1. Open sketch in editor
2. Click AI Tutor button
3. Click "📊 Analyze Sketch"
4. Read the detailed feedback
```

**Learning a Concept:**
```
1. Click AI Tutor button
2. Type: /explain interrupts
3. Get step-by-step explanation with examples
```

**Debugging an Issue:**
```
1. Click AI Tutor button
2. Type: /debug My LED code doesn't work
3. Tutor identifies the issue and helps fix it
```

## API Endpoints

### Check Service Status
```bash
GET /api/ai-tutor/status
```

Returns whether the AI tutor is available.

### Analyze Sketch
```bash
POST /api/ai-tutor/analyze-sketch
{
  "code": "void setup() { ... }",
  "components": [
    {"type": "LED", "id": "led1", "properties": {...}}
  ],
  "connections": [
    {"from": "pin13", "to": "led1"}
  ]
}
```

### Explain Concept
```bash
POST /api/ai-tutor/explain-concept
{
  "concept": "PWM",
  "context": "For LED brightness control"
}
```

### Debug Issue
```bash
POST /api/ai-tutor/debug-issue
{
  "issue": "LED not blinking",
  "code": "void setup() { ... }",
  "error_message": "optional compiler error"
}
```

## Response Format

All responses follow this structure:
```json
{
  "success": true,
  "analysis": "Detailed educational response...",
  "tokens_used": 1200,
  "error": null
}
```

## Educational Philosophy

The AI Tutor is designed for **General Education** contexts:

- **Student-Friendly**: Uses simple language, explains WHY things work
- **Encouraging**: Supportive tone, celebrates progress
- **Hands-On**: Provides practical examples and exercises
- **Comprehensive**: Covers circuit design AND code quality

## Limitations

- Requires active internet connection (Anthropic API)
- Limited to Arduino and basic electronics concepts
- Works best with sketches under 10KB
- Response time: 5-30 seconds depending on query complexity

## Troubleshooting

### "AI Tutor not configured"
**Solution:** Set the `ANTHROPIC_API_KEY` environment variable and restart the backend.

### "Thinking..." takes too long
**Solution:** Complex sketches or slow internet may cause delays. Try breaking the code into smaller pieces.

### "Analysis seems wrong"
**Solution:** Provide more context. Include error messages or be specific about what doesn't work.

### API Key Issues
- Verify your API key is valid at [console.anthropic.com](https://console.anthropic.com)
- Ensure the environment variable is set correctly
- Restart the backend after changing the key

## Cost

The AI Tutor uses Claude API (Anthropic). Typical costs:
- Single sketch analysis: ~$0.01-0.05
- Concept explanation: ~$0.01-0.03
- Debugging help: ~$0.01-0.05

See [Anthropic pricing](https://www.anthropic.com/pricing) for current rates.

## Future Enhancements

- 🔄 Multi-turn conversations
- 📊 Code style suggestions
- 🎓 Personalized learning paths
- 📈 Progress tracking
- 🌐 Multiple language support

## Contributing

Ideas? Found a bug? Open an issue on GitHub!

---

**Happy Learning! 🚀**

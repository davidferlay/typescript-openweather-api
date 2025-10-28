# Agentic Code Quality Check

This directory contains scripts for LLM-powered code quality analysis.


## check-unused-code.js

Uses Groq AI (Llama 3.3) to analyze the codebase and detect unused code that might have been left behind.


### Prerequisites

1. Get a **FREE** Groq API key from https://console.groq.com/
2. Set the environment variable:
   - Either locally:
   ```bash
   export GROQ_API_KEY=your_api_key_here
   ```
   - Or in .env file
   ```bash
   GROQ_API_KEY=your_api_key_here
   ```
   - Or in CI, add the `GROQ_API_KEY` secret to your repository:
    1. Go to Settings → Secrets and variables → Actions
    2. Click "New repository secret"
    3. Name: `GROQ_API_KEY`


### Usage

**Local usage:**
```bash
npm run check:unused
```

**In CI/CD:**
The check runs automatically via GitHub Actions on every push and pull request.
See job definition in `.github/workflows/pipeline.yml`


### What it detects

- Exported functions, classes, or variables never imported elsewhere
- Imported modules never actually used
- Internal functions/variables defined but never called
- Potentially dead routes or endpoints


### Cost considerations

Groq provides free API access with generous rate limits for their Llama 3.3 model.

Rate limits currently are (free tier):
- 30 requests per minute
- 6,000 requests per day
- 14,400 tokens per minute

Which should be enough for CI/CD usage on this projects.


### Why Groq?

- Free: No credit card required, genuine free tier
- Fast: Groq's LPU inference is extremely fast
- Good quality: Llama 3.3 70B is competitive with paid models for code analysis
- Reliable: Stable API with good uptime


### Alternatives

To use a different LLM provider (OpenAI, Anthropic, Google Gemini, etc.), modify `scripts/check-unused-code.js`:

1. Replace the `groq-sdk` import with your preferred provider
2. Update the API key environment variable name
3. Adjust the API call in the `analyzeWithLLM` function

Other free options to consider:
- **Hugging Face Inference API** (free tier)
- **Together AI** (free credits)
- **OpenRouter** (some free models available)


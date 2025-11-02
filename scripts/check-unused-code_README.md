
# Agentic Code Quality Check - check-unused-code.js

Uses Groq AI (Llama 3.3) to analyze the codebase and detect unused code that might have been left behind


### Prerequisites

1. Get a free Groq API key from https://console.groq.com/
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
    3. Add: `GROQ_API_KEY`


### Usage

- Local usage:
```bash
npm run check:unused
```

- In CI/CD:
Validation runs automatically via GitHub Actions on every push and pull request
See job definition in `.github/workflows/pipeline.yml`


### What it detects

- Exported functions, classes, or variables never imported elsewhere
- Imported modules never actually used
- Internal functions/variables defined but never called
- Potentially dead routes or endpoints


### Cost considerations

Groq provides free API access with viable rate limits for their Llama 3.3 model:
Currently:
- 30 requests per minute
- 6,000 requests per day
- 14,400 tokens per minute

Which should be enough for CI/CD usage on this projects


### Groq Alternatives

A different LLM provider can be used by updating `scripts/check-unused-code.js`:
1. Replace the `groq-sdk` import with your preferred provider
2. Update the API key environment variable name
3. Adjust the API call in the `analyzeWithLLM` function

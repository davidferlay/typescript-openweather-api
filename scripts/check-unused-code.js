#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 8000;

async function getAllTypeScriptFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      if (!file.name.startsWith('.') && file.name !== 'node_modules' && file.name !== 'dist') {
        await getAllTypeScriptFiles(filePath, fileList);
      }
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.test.ts') && !file.name.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function readCodebase(projectRoot) {
  const srcDir = join(projectRoot, 'src');
  const files = await getAllTypeScriptFiles(srcDir);

  const codebaseMap = {};
  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = relative(projectRoot, filePath);
    codebaseMap[relativePath] = content;
  }

  return codebaseMap;
}

function formatCodebaseForLLM(codebaseMap) {
  let formatted = "# Codebase Files\n\n";

  for (const [filePath, content] of Object.entries(codebaseMap)) {
    formatted += `## File: ${filePath}\n\`\`\`typescript\n${content}\n\`\`\`\n\n`;
  }

  return formatted;
}

async function analyzeWithLLM(codebase) {
  if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY environment variable is not set');
    console.error('Please set it to use this feature:');
    console.error('  1. Get a free API key from https://console.groq.com/');
    console.error('  2. export GROQ_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  const prompt = `You are a strict code quality analyzer. Analyze the following TypeScript codebase and identify ONLY genuinely unused code.

${codebase}

IMPORTANT RULES TO AVOID FALSE POSITIVES:
1. A function/variable used ANYWHERE in the same file is NOT unused (even if only called once)
2. An import IS used if ANY part of it is referenced (types, functions, values)
3. Helper functions called by exported functions ARE being used
4. Middleware functions registered with app.use() ARE being used
5. Route handlers registered with router.get/post/etc ARE being used
6. Functions passed as callbacks ARE being used
7. Properties accessed on imported modules (like jwt.sign, jwt.verify) mean the import IS used

ONLY report as unused:
1. Exported functions/classes/variables that are NEVER imported in ANY other file
2. Imports where NOTHING from that import is ever referenced in the file (not even types)
3. Private/internal functions that are defined but have ZERO references anywhere in the file
4. Variables declared but never read anywhere in the file

EXAMPLES OF NOT UNUSED:
- getEnvVar() called within same file -> NOT UNUSED
- jwt imported, jwt.sign() called -> NOT UNUSED
- logger imported, logger.warn() called -> NOT UNUSED
- execSync imported, used in a function -> NOT UNUSED
- trackRequest() called by metricsMiddleware -> NOT UNUSED

Be very conservative. When in doubt, do NOT report it as unused.

If you find NO unused code, respond with:
{
  "hasUnusedCode": false,
  "issues": []
}

Format your response as JSON:
{
  "hasUnusedCode": boolean,
  "issues": [
    {
      "file": "path/to/file.ts",
      "type": "unused_export|unused_import|unused_function|unused_variable",
      "name": "itemName",
      "explanation": "brief explanation of why this is genuinely unused"
    }
  ]
}`;

  console.log('🤖 Analyzing codebase with Groq AI (Llama 3.3)...\n');

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: MAX_TOKENS,
    response_format: { type: 'json_object' },
  });

  return completion.choices[0].message.content;
}

function parseResponse(response) {
  if (response.trim() === 'NO_UNUSED_CODE_FOUND') {
    return { hasUnusedCode: false, issues: [] };
  }

  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Warning: Could not parse LLM response as JSON');
    console.error('Response:', response);
    return { hasUnusedCode: false, issues: [] };
  }
}

async function main() {
  try {
    const projectRoot = process.cwd();

    console.log('📂 Reading codebase...\n');
    const codebaseMap = await readCodebase(projectRoot);
    const fileCount = Object.keys(codebaseMap).length;
    console.log(`   Found ${fileCount} TypeScript files\n`);

    const formattedCodebase = formatCodebaseForLLM(codebaseMap);

    const llmResponse = await analyzeWithLLM(formattedCodebase);
    const analysis = parseResponse(llmResponse);

    if (!analysis.hasUnusedCode || analysis.issues.length === 0) {
      console.log('✅ No unused code detected!\n');
      process.exit(0);
    }

    console.log('❌ Unused code detected:\n');
    for (const issue of analysis.issues) {
      console.log(`  📄 ${issue.file}`);
      console.log(`     Type: ${issue.type}`);
      console.log(`     Name: ${issue.name}`);
      console.log(`     Issue: ${issue.explanation}\n`);
    }

    console.log(`Found ${analysis.issues.length} unused code issue(s)\n`);
    process.exit(1);

  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

main();

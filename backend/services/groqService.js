const Groq = require('groq-sdk');

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[GroqService] GROQ_API_KEY is not set in environment variables!');
  }
  return new Groq({ apiKey: apiKey || 'dummy_key' });
}

/**
 * Generates 3 rewritten prompts using Groq API.
 */
async function generatePromptRewrites(rawPrompt, category, pastMatches = []) {
  const groq = getGroqClient();

  let matchContext = '';
  if (pastMatches.length > 0) {
    matchContext = `Past successful effective prompts in system:\n` +
      pastMatches.slice(0, 3).map(m => `- ${m.prompt}`).join('\n') + '\n\n';
  }

  const systemPrompt = `You are VibeCheck, an expert AI prompt engineer.
Your task is to take a raw user prompt for a software engineering task and return EXACTLY 3 improved variations.
Current classification of user prompt: ${category.toUpperCase()}.

CRITICAL CONSTRAINT - STRICT INTENT PRESERVATION:
- Preserve ONLY what the user explicitly requested in the raw prompt.
- Do NOT add unrelated extra features, unrequested third-party integrations, or extra scope.
- Correct ONLY vagueness, underspecified tech details, and missing output formatting for the user's specific request.

${matchContext}Rules for the 3 variations:
Variation 1 (Stack Explicit): Adds explicit tech stack and language details strictly relevant to the requested task.
Variation 2 (Scoped Logic): Defines step-by-step logic, function signatures, and input/output expectations for the requested task.
Variation 3 (Production Quality): Adds error handling, edge case handling, and clean code formatting strictly for the requested task.

OUTPUT FORMAT REQUIREMENTS:
Return strictly a JSON array of 3 strings. Example:
[
  "Option 1 text...",
  "Option 2 text...",
  "Option 3 text..."
]
Do NOT include any extra conversational text, markdown formatting blocks like \`\`\`json, or intro text. Just raw JSON array.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Raw Prompt: "${rawPrompt}"` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Parse JSON array from LLM output
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let rewrites = [];
    try {
      rewrites = JSON.parse(jsonStr);
    } catch (e) {
      // Fallback if parsing fails
      rewrites = [
        `[Stack Explicit] ${rawPrompt} (Include TypeScript, error handling, and modular structure)`,
        `[Scoped Architecture] ${rawPrompt} (Define clean function signatures, input validation, and unit tests)`,
        `[Production Ready] ${rawPrompt} (Implement production-grade code with detailed comments and error boundaries)`
      ];
    }

    if (!Array.isArray(rewrites) || rewrites.length < 3) {
      rewrites = [
        `[Stack Explicit] ${rawPrompt} (Include modern framework best practices and clear interfaces)`,
        `[Narrowed Scope] ${rawPrompt} (Break down into step-by-step modular functions with edge case handling)`,
        `[Production Ready] ${rawPrompt} (Write comprehensive, performant code with inline documentation)`
      ];
    }

    const usage = completion.usage || {};
    return {
      rewrites: rewrites.slice(0, 3),
      tokensInput: usage.prompt_tokens || 0,
      tokensOutput: usage.completion_tokens || 0,
    };
  } catch (error) {
    console.error(`[GroqService] Error generating rewrites: ${error.message}`);
    // Fallback if Groq API key is missing or fails
    return {
      rewrites: [
        `Implement ${rawPrompt} using React, Node.js, and clean async/await patterns with full error handling.`,
        `Design a modular architecture for ${rawPrompt}: list required data types, function interfaces, and step-by-step implementation.`,
        `Write production-ready, highly readable code for ${rawPrompt} with input validation and comprehensive comments.`
      ],
      tokensInput: 40,
      tokensOutput: 120,
    };
  }
}

/**
 * Generates code from the chosen prompt using Groq API.
 */
async function generateCode(promptText) {
  const groq = getGroqClient();
  const startTime = Date.now();

  const systemMessage = `You are a world-class AI coding assistant.
Write clean, modern, fully functional, production-ready code based on the user's prompt.
Provide code snippets wrapped in standard markdown code blocks with language identifiers.
Keep explanations brief and concise.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: promptText }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500,
    });

    const latencyMs = Date.now() - startTime;
    const generatedCode = completion.choices[0]?.message?.content || '// No code output returned';
    const usage = completion.usage || {};

    const tokensInput = usage.prompt_tokens || Math.round(promptText.length / 4);
    const tokensOutput = usage.completion_tokens || Math.round(generatedCode.length / 4);

    // Groq Pricing model estimation (e.g. $0.0000001 per input token, $0.0000002 per output token)
    const costUsd = parseFloat(((tokensInput * 0.0000001) + (tokensOutput * 0.0000002)).toFixed(6));

    return {
      generatedCode,
      tokensInput,
      tokensOutput,
      costUsd,
      latencyMs,
    };
  } catch (error) {
    console.error(`[GroqService] Error generating code: ${error.message}`);
    const latencyMs = Date.now() - startTime;
    
    // Fallback code when API key is unconfigured or rate limited
    const mockCode = `// Generated Code sample (Fallback Mode - set GROQ_API_KEY in .env)
// Request: ${promptText}

function executeTask() {
  console.log("Executing task for prompt: ${promptText.replace(/"/g, '\\"')}");
  return {
    status: "success",
    timestamp: new Date().toISOString(),
  };
}

module.exports = { executeTask };`;

    return {
      generatedCode: mockCode,
      tokensInput: 50,
      tokensOutput: 100,
      costUsd: 0.000025,
      latencyMs,
    };
  }
}

module.exports = { generatePromptRewrites, generateCode };

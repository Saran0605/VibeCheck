const express = require('express');
const router = express.Router();
const { trace } = require('@opentelemetry/api');
const authMiddleware = require('../middleware/auth');
const PromptHistory = require('../models/PromptHistory');
const { classifyPrompt } = require('../services/classifierService');
const { generateEmbedding } = require('../services/embeddingService');
const { generateCode } = require('../services/groqService');

const tracer = trace.getTracer('generate-tracer');

router.post('/generate', authMiddleware, async (req, res) => {
  const { prompt, rawPrompt, chosenPrompt } = req.body;

  const actualChosenPrompt = chosenPrompt || prompt;
  const actualRawPrompt = rawPrompt || prompt;

  if (!actualChosenPrompt || typeof actualChosenPrompt !== 'string' || actualChosenPrompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt content is required' });
  }

  if (actualChosenPrompt.length > 8000) {
    return res.status(400).json({ error: 'Prompt is too long (maximum 8000 characters)' });
  }

  const userId = req.user.id;

  return tracer.startActiveSpan('prompt_generation_execution', async (span) => {
    try {
      const traceId = span.spanContext().traceId;
      const category = req.body.category || classifyPrompt(actualRawPrompt);

      span.setAttribute('prompt.category', category);
      span.setAttribute('prompt.raw', actualRawPrompt);
      span.setAttribute('prompt.chosen', actualChosenPrompt);

      // Generate embedding for chosen prompt asynchronously or inline for history matching
      const embedding = await generateEmbedding(actualChosenPrompt);

      // Call Groq API to generate code
      const result = await generateCode(actualChosenPrompt);

      const { generatedCode, tokensInput, tokensOutput, costUsd, latencyMs } = result;

      // Set OTel span attributes
      span.setAttribute('tokens.input', tokensInput);
      span.setAttribute('tokens.output', tokensOutput);
      span.setAttribute('cost.usd', costUsd);
      span.setAttribute('latency.ms', latencyMs);
      span.setAttribute('user.id', userId);

      // Store in MongoDB PromptHistory
      const promptHistoryDoc = new PromptHistory({
        userId,
        rawPrompt: actualRawPrompt,
        chosenPrompt: actualChosenPrompt,
        category,
        embedding,
        tokensInput,
        tokensOutput,
        costUsd,
        latencyMs,
        success: true, // Default true, user can toggle feedback
        generatedCode,
        traceId,
      });

      await promptHistoryDoc.save();

      // Emit correlated structured log line
      console.log(`[PROMPT_EXECUTION] prompt executed category=${category} cost=${costUsd} tokens_in=${tokensInput} tokens_out=${tokensOutput} latency_ms=${latencyMs} success=true traceId=${traceId}`);

      span.end();

      return res.json({
        id: promptHistoryDoc._id,
        generatedCode,
        category,
        tokensInput,
        tokensOutput,
        costUsd,
        latencyMs,
        traceId,
        success: promptHistoryDoc.success,
      });
    } catch (error) {
      console.error(`[GenerateRoute] Error in /api/generate: ${error.message}`);
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message }); // Error status
      span.end();
      return res.status(500).json({ error: 'Failed to generate code from prompt' });
    }
  });
});

module.exports = router;

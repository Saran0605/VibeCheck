const express = require('express');
const router = express.Router();
const { trace } = require('@opentelemetry/api');
const authMiddleware = require('../middleware/auth');
const { classifyPrompt } = require('../services/classifierService');
const { generateEmbedding } = require('../services/embeddingService');
const { findSimilarPrompts } = require('../services/similarityService');
const { generatePromptRewrites } = require('../services/groqService');

const tracer = trace.getTracer('promptify-tracer');

router.post('/promptify', authMiddleware, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt is too long (maximum 5000 characters)' });
  }

  const rawPrompt = prompt.trim();

  // Create root span for promptify action or get active span
  const activeSpan = trace.getActiveSpan();

  try {
    // 1. Classification span
    let category = 'underspecified';
    await tracer.startActiveSpan('classification', async (span) => {
      try {
        category = classifyPrompt(rawPrompt);
        span.setAttribute('prompt.raw', rawPrompt);
        span.setAttribute('prompt.category', category);
      } finally {
        span.end();
      }
    });

    // 2. Embedding span
    let embedding = [];
    await tracer.startActiveSpan('embedding', async (span) => {
      try {
        embedding = await generateEmbedding(rawPrompt);
        span.setAttribute('embedding.dimensions', embedding.length);
      } finally {
        span.end();
      }
    });

    // 3. Similarity Search span
    let similarityResult = { topMatches: [], predictions: {} };
    await tracer.startActiveSpan('similarity_search', async (span) => {
      try {
        similarityResult = await findSimilarPrompts(embedding, rawPrompt);
        span.setAttribute('matches.count', similarityResult.topMatches.length);
        span.setAttribute('predictions.tokens_input', similarityResult.predictions.tokensInput);
        span.setAttribute('predictions.tokens_output', similarityResult.predictions.tokensOutput);
        span.setAttribute('predictions.cost_usd', similarityResult.predictions.costUsd);
      } finally {
        span.end();
      }
    });

    // 4. Rewrite Generation span
    let rewritesResult = { rewrites: [] };
    await tracer.startActiveSpan('rewrite_generation', async (span) => {
      try {
        rewritesResult = await generatePromptRewrites(
          rawPrompt,
          category,
          similarityResult.topMatches
        );
        span.setAttribute('rewrites.count', rewritesResult.rewrites.length);
      } finally {
        span.end();
      }
    });

    // Format output suggestions with individual predicted cost/token badges
    const basePredictions = similarityResult.predictions;
    const suggestions = rewritesResult.rewrites.map((rewriteText, idx) => {
      // Scale token/cost predictions slightly based on rewrite word count variations
      const wordFactor = (rewriteText.split(/\s+/).length / (rawPrompt.split(/\s+/).length || 1));
      const scaledInputTokens = Math.max(20, Math.round(basePredictions.tokensInput * Math.min(1.8, Math.max(0.8, wordFactor))));
      const scaledOutputTokens = basePredictions.tokensOutput;
      const scaledCost = parseFloat(((scaledInputTokens * 0.0000001) + (scaledOutputTokens * 0.0000002)).toFixed(6));

      return {
        id: `sug_${idx + 1}`,
        rawPrompt: rawPrompt,
        rewrittenPrompt: rewriteText,
        category,
        predictedTokensInput: scaledInputTokens,
        predictedTokensOutput: scaledOutputTokens,
        predictedCostUsd: scaledCost,
        predictedLatencyMs: basePredictions.latencyMs,
        title: idx === 0 ? 'Stack Explicit' : idx === 1 ? 'Scoped Architecture' : 'Production Grade',
      };
    });

    return res.json({
      rawPrompt,
      category,
      suggestions,
      embedding,
    });
  } catch (error) {
    console.error(`[PromptifyRoute] Error in /api/promptify: ${error.message}`);
    if (activeSpan) activeSpan.recordException(error);
    return res.status(500).json({ error: 'Failed to optimize prompt' });
  }
});

module.exports = router;

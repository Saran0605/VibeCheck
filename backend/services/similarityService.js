const PromptHistory = require('../models/PromptHistory');

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Finds top matching successful prompts from DB and predicts token/cost stats.
 */
async function findSimilarPrompts(targetEmbedding, rawPrompt) {
  try {
    // Find past successful prompts with valid embeddings
    const pastPrompts = await PromptHistory.find({
      success: true,
      embedding: { $exists: true, $ne: [] }
    }).limit(100).exec();

    if (!pastPrompts || pastPrompts.length === 0) {
      // Heuristic estimates for new/empty DB
      const wordCount = rawPrompt ? rawPrompt.trim().split(/\s+/).length : 20;
      const estimatedInputTokens = Math.max(15, wordCount * 2);
      const estimatedOutputTokens = 350;
      const estimatedCost = (estimatedInputTokens * 0.0000001) + (estimatedOutputTokens * 0.0000002);
      const estimatedLatency = 850;

      return {
        topMatches: [],
        predictions: {
          tokensInput: Math.round(estimatedInputTokens),
          tokensOutput: Math.round(estimatedOutputTokens),
          costUsd: parseFloat(estimatedCost.toFixed(6)),
          latencyMs: estimatedLatency,
        }
      };
    }

    // Rank by cosine similarity
    const scored = pastPrompts.map(doc => {
      const sim = cosineSimilarity(targetEmbedding, doc.embedding);
      return { doc, sim };
    });

    scored.sort((a, b) => b.sim - a.sim);

    const topK = scored.slice(0, 5);
    const validMatches = topK.filter(item => item.sim > 0.1);

    if (validMatches.length === 0) {
      const wordCount = rawPrompt ? rawPrompt.trim().split(/\s+/).length : 20;
      const estimatedInputTokens = Math.max(15, wordCount * 2);
      const estimatedOutputTokens = 400;
      const estimatedCost = (estimatedInputTokens * 0.0000001) + (estimatedOutputTokens * 0.0000002);

      return {
        topMatches: [],
        predictions: {
          tokensInput: Math.round(estimatedInputTokens),
          tokensOutput: Math.round(estimatedOutputTokens),
          costUsd: parseFloat(estimatedCost.toFixed(6)),
          latencyMs: 900,
        }
      };
    }

    // Average metrics of top matches
    const avgInput = validMatches.reduce((acc, curr) => acc + (curr.doc.tokensInput || 0), 0) / validMatches.length;
    const avgOutput = validMatches.reduce((acc, curr) => acc + (curr.doc.tokensOutput || 0), 0) / validMatches.length;
    const avgCost = validMatches.reduce((acc, curr) => acc + (curr.doc.costUsd || 0), 0) / validMatches.length;
    const avgLatency = validMatches.reduce((acc, curr) => acc + (curr.doc.latencyMs || 0), 0) / validMatches.length;

    return {
      topMatches: validMatches.map(m => ({
        id: m.doc._id,
        prompt: m.doc.chosenPrompt,
        similarity: m.sim,
        costUsd: m.doc.costUsd,
      })),
      predictions: {
        tokensInput: Math.max(10, Math.round(avgInput)),
        tokensOutput: Math.max(50, Math.round(avgOutput)),
        costUsd: parseFloat(avgCost.toFixed(6)),
        latencyMs: Math.round(avgLatency),
      }
    };
  } catch (err) {
    console.error(`[SimilarityService] Error searching similarities: ${err.message}`);
    return {
      topMatches: [],
      predictions: {
        tokensInput: 50,
        tokensOutput: 300,
        costUsd: 0.00007,
        latencyMs: 800,
      }
    };
  }
}

module.exports = { cosineSimilarity, findSimilarPrompts };

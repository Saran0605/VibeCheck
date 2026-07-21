const { pipeline } = require('@xenova/transformers');

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    console.log('[EmbeddingService] Loading Xenova/all-MiniLM-L6-v2 feature-extraction model...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[EmbeddingService] Model loaded successfully.');
  }
  return extractor;
}

/**
 * Generates a 384-dimensional embedding vector for input text.
 * Falls back to deterministic hash vector if transformer fails.
 */
async function generateEmbedding(text) {
  try {
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    // Convert Float32Array to standard JS Array of numbers
    const embeddingArray = Array.from(output.data);
    return embeddingArray;
  } catch (error) {
    console.warn(`[EmbeddingService] Transformer failed or unavailable, using fallback vector generator: ${error.message}`);
    // Simple deterministic fallback vector generator for local testing resilience
    const vector = new Array(384).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      vector[i % 384] += charCode / 255;
    }
    // Normalize fallback vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => v / norm);
  }
}

module.exports = { generateEmbedding };

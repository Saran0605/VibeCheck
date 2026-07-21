/**
 * Rule-based heuristic prompt classifier.
 * Categorizes prompts into 'vague', 'underspecified', or 'well-scoped'.
 */
function classifyPrompt(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    return 'vague';
  }

  const trimmed = promptText.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Tech stack keywords
  const techKeywords = [
    'react', 'express', 'node', 'mongodb', 'mongoose', 'python', 'javascript',
    'typescript', 'sql', 'postgres', 'docker', 'api', 'rest', 'graphql',
    'html', 'css', 'tailwind', 'redux', 'next.js', 'vite', 'opentelemetry',
    'signoz', 'jwt', 'bcrypt', 'prisma', 'django', 'flask', 'fastapi'
  ];

  // Specificity / requirement indicators
  const specKeywords = [
    'function', 'class', 'endpoint', 'route', 'async', 'await', 'schema',
    'interface', 'type', 'error handling', 'status code', 'json', 'param',
    'response', 'return', 'unit test', 'validation', 'middleware', 'rate limit'
  ];

  const lowerText = trimmed.toLowerCase();

  let techMatches = 0;
  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) techMatches++;
  }

  let specMatches = 0;
  for (const keyword of specKeywords) {
    if (lowerText.includes(keyword)) specMatches++;
  }

  // Classification rules
  if (wordCount < 10 && techMatches === 0 && specMatches === 0) {
    return 'vague';
  }

  if (wordCount >= 15 && techMatches >= 1 && specMatches >= 1) {
    return 'well-scoped';
  }

  if (wordCount >= 25 && (techMatches >= 2 || specMatches >= 2)) {
    return 'well-scoped';
  }

  if (wordCount < 6) {
    return 'vague';
  }

  return 'underspecified';
}

module.exports = { classifyPrompt };

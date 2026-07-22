/** Shared UI helpers — presentation only */

export function categoryBadgeClass(category) {
  if (category === 'well-scoped') return 'badge badge-category-well-scoped';
  if (category === 'underspecified') return 'badge badge-category-underspecified';
  if (category === 'vague') return 'badge badge-category-vague';
  return 'badge';
}

export function formatCost(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `$${Number(value).toFixed(6)}`;
}

export function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

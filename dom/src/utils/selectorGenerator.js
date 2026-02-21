/**
 * CSS Selector Generator (Browser-side)
 *
 * Generates a stable, optimized CSS selector for a DOM element.
 * Designed to be injected into the browser context as a string.
 *
 * Strategy:
 *  1. If the element has a unique, non-dynamic `id`, return `#id`.
 *  2. Otherwise, walk up the tree building a `tag:nth-of-type(n)` chain.
 *  3. Dynamic-ID heuristic skips IDs that look auto-generated.
 */

/**
 * Returns the selector generator function source as a string
 * suitable for injection via addInitScript.
 */
export function getSelectorGeneratorSource() {
  return `
(function () {
  if (window.__generateSelector) return;

  const DYNAMIC_ID_PATTERNS = [
    /^[a-f0-9]{8,}$/i,            // hex hashes
    /^[0-9a-f]{8}-[0-9a-f]{4}-/i, // UUIDs
    /:r[0-9]+:/,                   // React-generated IDs
    /^ember[0-9]+$/,               // Ember.js IDs
    /^[a-z]+-[a-f0-9]{5,}$/i,     // prefix-hash patterns
    /^__/,                         // dunder-prefixed internal IDs
    /^js-/,                        // js- prefixed IDs (often dynamic)
    /\\d{10,}/,                     // very long numeric sequences
  ];

  function isDynamicId(id) {
    if (!id) return true;
    return DYNAMIC_ID_PATTERNS.some((pattern) => pattern.test(id));
  }

  function getNthOfType(el) {
    const parent = el.parentElement;
    if (!parent) return 1;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === el.tagName
    );
    return siblings.indexOf(el) + 1;
  }

  function generateSelector(el) {
    if (!el || el === document.body || el === document.documentElement) {
      return 'body';
    }

    // Strategy 1: Unique stable ID
    if (el.id && !isDynamicId(el.id)) {
      // Verify uniqueness
      if (document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) {
        return '#' + CSS.escape(el.id);
      }
    }

    // Strategy 2: Build a path from body → element
    const parts = [];
    let current = el;

    while (current && current !== document.body && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase();

      // Check if this ancestor has a stable unique id we can anchor to
      if (current.id && !isDynamicId(current.id)) {
        if (document.querySelectorAll('#' + CSS.escape(current.id)).length === 1) {
          parts.unshift('#' + CSS.escape(current.id));
          break;
        }
      }

      const nth = getNthOfType(current);
      const siblings = current.parentElement
        ? Array.from(current.parentElement.children).filter((c) => c.tagName === current.tagName)
        : [];
      const segment = siblings.length > 1 ? tag + ':nth-of-type(' + nth + ')' : tag;

      parts.unshift(segment);
      current = current.parentElement;
    }

    if (parts.length === 0) return 'body';

    // Prepend 'body' only if we didn't anchor to an id
    if (!parts[0].startsWith('#')) {
      parts.unshift('body');
    }

    return parts.join(' > ');
  }

  window.__generateSelector = generateSelector;
})();
`;
}

/**
 * Smart Selector Generator (Browser-side)
 *
 * Generates the most stable, replay-friendly CSS selector for a DOM element.
 * Injected into the browser context as a string via addInitScript.
 *
 * 4-Tier Priority Cascade:
 *  1. data-testid / data-cy / data-test attributes
 *  2. Unique stable id (skips dynamic/auto-generated IDs)
 *  3. Semantic ARIA label (aria-label, aria-labelledby)
 *  4. Robust CSS path (prefers unique class anchors, avoids nth-child)
 *
 * Every candidate is validated for uniqueness before acceptance.
 */

/**
 * Returns the selector generator as a self-executing IIFE string
 * suitable for injection via context.addInitScript().
 *
 * Exposes `window.__generateSelector(element)` in the page context.
 */
export function getSelectorGeneratorSource() {
  return `
(function () {
  if (window.__generateSelector) return;

  // ── Helpers ──────────────────────────────────────────────────────────

  /**
   * Patterns that indicate an ID was auto-generated and should not be
   * trusted for stable selector anchoring.
   */
  const DYNAMIC_ID_PATTERNS = [
    /^[a-f0-9]{8,}$/i,            // hex hashes
    /^[0-9a-f]{8}-[0-9a-f]{4}-/i, // UUIDs
    /:r[0-9]+:/,                   // React-generated IDs
    /^ember[0-9]+$/,               // Ember.js IDs
    /^[a-z]+-[a-f0-9]{5,}$/i,     // prefix-hash patterns
    /^__/,                         // dunder-prefixed internal IDs
    /^js-/,                        // js- prefixed IDs (often dynamic)
    /\\d{10,}/,                     // very long numeric sequences
    /^:[a-z]/,                     // Vue/Radix scoped IDs
    /^react-/i,                    // React portals / aria
  ];

  /** Test data attributes in priority order. */
  const TEST_ATTRIBUTES = ['data-testid', 'data-cy', 'data-test'];

  function isDynamicId(id) {
    if (!id) return true;
    return DYNAMIC_ID_PATTERNS.some(function (p) { return p.test(id); });
  }

  /**
   * Returns true if the given CSS selector resolves to exactly one element.
   */
  function isUnique(selector) {
    try {
      return document.querySelectorAll(selector).length === 1;
    } catch (_) {
      return false;
    }
  }

  // ── Tier 1: Test data attributes ─────────────────────────────────────

  function tryTestAttribute(el) {
    for (var i = 0; i < TEST_ATTRIBUTES.length; i++) {
      var attr = TEST_ATTRIBUTES[i];
      var value = el.getAttribute(attr);
      if (value) {
        var candidate = '[' + attr + '="' + CSS.escape(value) + '"]';
        if (isUnique(candidate)) return candidate;
      }
    }
    return null;
  }

  // ── Tier 2: Unique stable ID ─────────────────────────────────────────

  function tryId(el) {
    if (!el.id || isDynamicId(el.id)) return null;
    var candidate = '#' + CSS.escape(el.id);
    if (isUnique(candidate)) return candidate;
    return null;
  }

  // ── Tier 3: Semantic ARIA labels ─────────────────────────────────────

  function tryAriaLabel(el) {
    var label = el.getAttribute('aria-label');
    if (label) {
      var tag = el.tagName.toLowerCase();
      var candidate = tag + '[aria-label="' + CSS.escape(label) + '"]';
      if (isUnique(candidate)) return candidate;
    }

    // aria-labelledby: resolve referenced element text
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var tag2 = el.tagName.toLowerCase();
      var candidate2 = tag2 + '[aria-labelledby="' + CSS.escape(labelledBy) + '"]';
      if (isUnique(candidate2)) return candidate2;
    }

    // role-based selectors
    var role = el.getAttribute('role');
    var name = el.getAttribute('aria-label') || el.getAttribute('name');
    if (role && name) {
      var candidate3 = '[role="' + CSS.escape(role) + '"][aria-label="' + CSS.escape(name) + '"]';
      if (isUnique(candidate3)) return candidate3;
    }

    return null;
  }

  // ── Tier 4: Robust CSS path ──────────────────────────────────────────

  function tryRobustCssPath(el) {
    var parts = [];
    var current = el;

    while (current && current !== document.body && current !== document.documentElement) {
      var tag = current.tagName.toLowerCase();

      // Anchor to test attributes on ancestors
      for (var i = 0; i < TEST_ATTRIBUTES.length; i++) {
        var attrVal = current.getAttribute(TEST_ATTRIBUTES[i]);
        if (attrVal) {
          var anchor = '[' + TEST_ATTRIBUTES[i] + '="' + CSS.escape(attrVal) + '"]';
          if (isUnique(anchor)) {
            parts.unshift(anchor);
            var full = parts.join(' > ');
            if (isUnique(full)) return full;
            // If not unique yet, keep walking
            current = current.parentElement;
            continue;
          }
        }
      }

      // Anchor to a stable unique ID on ancestors
      if (current.id && !isDynamicId(current.id)) {
        var idSel = '#' + CSS.escape(current.id);
        if (isUnique(idSel)) {
          parts.unshift(idSel);
          var full2 = parts.join(' > ');
          if (isUnique(full2)) return full2;
        }
      }

      // Try tag + unique class combination
      var segment = buildSegment(current);
      parts.unshift(segment);

      // Check if current path is already unique
      var candidate = parts.join(' > ');
      if (isUnique(candidate)) return candidate;

      current = current.parentElement;
    }

    // Prepend body if no anchor was found
    if (parts.length > 0 && !parts[0].startsWith('#') && !parts[0].startsWith('[')) {
      parts.unshift('body');
    }

    return parts.length > 0 ? parts.join(' > ') : 'body';
  }

  /**
   * Build the most descriptive single-element segment.
   * Prefers tag.uniqueClass over tag:nth-of-type(n).
   */
  function buildSegment(el) {
    var tag = el.tagName.toLowerCase();
    var classes = Array.from(el.classList).filter(function (c) {
      // Exclude classes that look auto-generated
      return c.length > 1 && c.length < 40 && !/[0-9]{4,}/.test(c) && !/^_/.test(c);
    });

    // Try tag + single distinctive class
    for (var i = 0; i < classes.length; i++) {
      var withClass = tag + '.' + CSS.escape(classes[i]);
      var parent = el.parentElement;
      if (parent) {
        var siblings = parent.querySelectorAll(':scope > ' + withClass);
        if (siblings.length === 1) return withClass;
      }
    }

    // Try tag + multiple classes (up to 2)
    if (classes.length >= 2) {
      var combo = tag + '.' + CSS.escape(classes[0]) + '.' + CSS.escape(classes[1]);
      var parent2 = el.parentElement;
      if (parent2) {
        try {
          var siblings2 = parent2.querySelectorAll(':scope > ' + combo);
          if (siblings2.length === 1) return combo;
        } catch(_) {}
      }
    }

    // Fallback: tag:nth-of-type(n)
    var parent3 = el.parentElement;
    if (parent3) {
      var sameTags = Array.from(parent3.children).filter(function (c) {
        return c.tagName === el.tagName;
      });
      if (sameTags.length > 1) {
        return tag + ':nth-of-type(' + (sameTags.indexOf(el) + 1) + ')';
      }
    }

    return tag;
  }

  // ── Main Generator ───────────────────────────────────────────────────

  /**
   * Generate the best selector for the given element using the 4-tier
   * priority cascade. Returns a string CSS selector.
   */
  function generateSelector(el) {
    if (!el || el === document.body || el === document.documentElement) {
      return 'body';
    }

    // Tier 1 — Test data attributes
    var t1 = tryTestAttribute(el);
    if (t1) return t1;

    // Tier 2 — Unique stable ID
    var t2 = tryId(el);
    if (t2) return t2;

    // Tier 3 — ARIA labels
    var t3 = tryAriaLabel(el);
    if (t3) return t3;

    // Tier 4 — Robust CSS path
    return tryRobustCssPath(el);
  }

  window.__generateSelector = generateSelector;
})();
`;
}

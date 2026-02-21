/**
 * Recursive DOM-to-JSON Mapper (Browser-side)
 *
 * Walks the DOM tree starting from document.body, producing a JSON-serializable
 * tree of every element with its metadata, computed styles, and shadow roots.
 *
 * Exported as a function source string for use with page.evaluate().
 */

/**
 * Returns the DOM mapper function source to be passed to page.evaluate.
 *
 * Usage in Node:
 *   const snapshot = await page.evaluate(getDomMapperSource(), targetSelector);
 */
export function getDomMapperSource() {
  // We return a function (not an IIFE) — Playwright will call it with args.
  return function mapDOM(targetSelector) {
    let nodeCounter = 0;

    const ESSENTIAL_STYLES = [
      'display',
      'visibility',
      'opacity',
      'position',
      'overflow',
      'width',
      'height',
      'color',
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'zIndex',
      'pointerEvents',
    ];

    function getComputedStyles(el) {
      const styles = {};
      try {
        const computed = window.getComputedStyle(el);
        for (const prop of ESSENTIAL_STYLES) {
          styles[prop] = computed.getPropertyValue(
            prop.replace(/([A-Z])/g, '-$1').toLowerCase()
          );
        }
      } catch (_) {
        // Element may not support getComputedStyle (e.g., SVG foreignObject children)
      }
      return styles;
    }

    function getAttributes(el) {
      const attrs = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    }

    function getBoundingBox(el) {
      try {
        const rect = el.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      } catch (_) {
        return null;
      }
    }

    function isTargetMatch(el, selector) {
      if (!selector) return false;
      try {
        return el.matches(selector);
      } catch (_) {
        return false;
      }
    }

    function walkNode(el) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;

      const uniqueId = `node-${nodeCounter++}`;
      const tagName = el.tagName.toLowerCase();
      const textContent = (el.textContent || '').trim().slice(0, 200);

      const node = {
        unique_id: uniqueId,
        tagName,
        id: el.id || null,
        classList: Array.from(el.classList),
        attributes: getAttributes(el),
        computedStyle: getComputedStyles(el),
        textContent: textContent || null,
        boundingBox: getBoundingBox(el),
        children: [],
      };

      // Mark interaction target
      if (isTargetMatch(el, targetSelector)) {
        node.is_interaction_target = true;
      }

      // Pierce Shadow DOM
      if (el.shadowRoot) {
        node.shadowRoot = [];
        for (const child of el.shadowRoot.children) {
          const mapped = walkNode(child);
          if (mapped) node.shadowRoot.push(mapped);
        }
      }

      // Regular children
      for (const child of el.children) {
        const mapped = walkNode(child);
        if (mapped) node.children.push(mapped);
      }

      return node;
    }

    return walkNode(document.body);
  };
}

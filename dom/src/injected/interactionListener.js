/**
 * Interaction Listener — Injected Script
 *
 * This module exports the source code string of a self-contained IIFE
 * that will be injected into every page/frame via context.addInitScript().
 *
 * It listens for click, change, submit, and Enter keydown events,
 * captures the target immediately, debounces for 80ms to let the DOM settle,
 * then calls the exposed binding `__reportInteraction` with metadata.
 */

import { getSelectorGeneratorSource } from '../utils/selectorGenerator.js';

export function getInteractionListenerSource() {
  const selectorGen = getSelectorGeneratorSource();

  return `
${selectorGen}

(function () {
  if (window.__interactionListenerInstalled) return;
  window.__interactionListenerInstalled = true;

  const DEBOUNCE_MS = 80;
  const TRACKED_EVENTS = ['click', 'change', 'submit', 'keydown'];

  let debounceTimer = null;
  let pendingTarget = null;
  let pendingEventType = null;

  function getTargetMeta(el, eventType) {
    if (!el || !el.tagName) return null;

    const selector = window.__generateSelector(el);
    const text = (el.textContent || '').trim().slice(0, 200);

    let boundingBox = null;
    try {
      const rect = el.getBoundingClientRect();
      boundingBox = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    } catch (_) {}

    return {
      type: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      targetSelector: selector,
      textContent: text || null,
      boundingBox,
      tagName: el.tagName.toLowerCase(),
      unique_id: 'target-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    };
  }

  function flushInteraction() {
    if (!pendingTarget) return;

    const meta = getTargetMeta(pendingTarget, pendingEventType);
    pendingTarget = null;
    pendingEventType = null;

    if (meta && window.__reportInteraction) {
      window.__reportInteraction(meta);
    }
  }

  function handleEvent(event) {
    // Only track Enter for keydown
    if (event.type === 'keydown' && event.key !== 'Enter') return;

    // Capture target immediately (before DOM might change)
    pendingTarget = event.target;
    pendingEventType = event.type;

    // Debounce: wait for DOM to settle
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushInteraction, DEBOUNCE_MS);
  }

  // Attach listeners in capture phase for earliest interception
  for (const eventType of TRACKED_EVENTS) {
    document.addEventListener(eventType, handleEvent, { capture: true, passive: true });
  }

  // Handle page unload — flush any pending interaction immediately
  window.addEventListener('beforeunload', () => {
    if (pendingTarget) {
      clearTimeout(debounceTimer);
      flushInteraction();
    }
  });
})();
`;
}

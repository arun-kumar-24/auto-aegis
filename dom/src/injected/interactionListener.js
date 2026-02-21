/**
 * Precision Interaction Listener — Injected Script
 *
 * This module exports the source code string of a self-contained IIFE
 * that will be injected into every page/frame via context.addInitScript().
 *
 * Event Scope:
 *   click, input (debounced 300ms), change (select/checkbox/radio),
 *   submit, and SPA navigation (pushState/replaceState/popstate).
 *
 * For each event it performs Target-Only Extraction:
 *   - Best selector via 4-tier generator
 *   - tagName, id, classList, attributes, innerText, value
 *
 * Post-Action Checks (per action):
 *   - URL change detection (before vs after)
 *   - MutationObserver for new significant elements (500ms window)
 *
 * Network Idle Detection:
 *   - Monkey-patches fetch/XMLHttpRequest to track in-flight requests
 *   - Suppresses interaction capture during initial page load
 *
 * Communicates with Node.js via the exposed binding:
 *   window.__reportInteraction(actionPayload)
 */

import { getSelectorGeneratorSource } from '../utils/selectorGenerator.js';

export function getInteractionListenerSource() {
  const selectorGen = getSelectorGeneratorSource();

  return `
${selectorGen}

(function () {
  if (window.__interactionListenerInstalled) return;
  window.__interactionListenerInstalled = true;

  // ── Configuration ────────────────────────────────────────────────────

  var INPUT_DEBOUNCE_MS = 300;
  var POST_ACTION_OBSERVE_MS = 500;
  var INITIAL_LOAD_GRACE_MS = 2000;

  // ── State ────────────────────────────────────────────────────────────

  var stepCounter = 0;
  var lastActionTimestamp = null;
  var pageLoadTimestamp = Date.now();
  var inFlightRequests = 0;
  var inputDebounceTimers = {};  // keyed by element reference id

  // ── Network Idle Detection ───────────────────────────────────────────
  // Monkey-patch fetch and XMLHttpRequest to count in-flight requests.

  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function () {
      inFlightRequests++;
      return originalFetch.apply(this, arguments)
        .then(function (response) { inFlightRequests = Math.max(0, inFlightRequests - 1); return response; })
        .catch(function (err) { inFlightRequests = Math.max(0, inFlightRequests - 1); throw err; });
    };
  }

  var OrigXHR = window.XMLHttpRequest;
  var origOpen = OrigXHR.prototype.open;
  var origSend = OrigXHR.prototype.send;

  OrigXHR.prototype.open = function () {
    this.__tracked = true;
    return origOpen.apply(this, arguments);
  };

  OrigXHR.prototype.send = function () {
    if (this.__tracked) {
      inFlightRequests++;
      var self = this;
      var onDone = function () {
        inFlightRequests = Math.max(0, inFlightRequests - 1);
        self.removeEventListener('load', onDone);
        self.removeEventListener('error', onDone);
        self.removeEventListener('abort', onDone);
      };
      this.addEventListener('load', onDone);
      this.addEventListener('error', onDone);
      this.addEventListener('abort', onDone);
    }
    return origSend.apply(this, arguments);
  };

  /**
   * Returns true if the page is still in initial load phase with
   * outstanding network activity.
   */
  function isPageLoading() {
    var elapsed = Date.now() - pageLoadTimestamp;
    return elapsed < INITIAL_LOAD_GRACE_MS && inFlightRequests > 0;
  }

  // ── SPA Navigation Detection ─────────────────────────────────────────
  // Monkey-patch pushState / replaceState and listen for popstate.

  var currentUrl = window.location.href;

  function onSpaNavigation(method) {
    var newUrl = window.location.href;
    if (newUrl === currentUrl) return;
    var oldUrl = currentUrl;
    currentUrl = newUrl;

    reportAction({
      type: 'navigation',
      navigationMethod: method,
      fromUrl: oldUrl,
      toUrl: newUrl,
    });
  }

  var origPushState = history.pushState;
  history.pushState = function () {
    var result = origPushState.apply(this, arguments);
    onSpaNavigation('pushState');
    return result;
  };

  var origReplaceState = history.replaceState;
  history.replaceState = function () {
    var result = origReplaceState.apply(this, arguments);
    onSpaNavigation('replaceState');
    return result;
  };

  window.addEventListener('popstate', function () {
    onSpaNavigation('popstate');
  });

  // ── Target Metadata Extraction ───────────────────────────────────────

  /**
   * Extract all relevant metadata from the interaction target element.
   */
  function extractTargetMeta(el) {
    if (!el || !el.tagName) return null;

    var tag = el.tagName.toUpperCase();
    var selector = window.__generateSelector ? window.__generateSelector(el) : null;
    var text = null;
    var value = null;

    // innerText for buttons, links, headings, labels
    var textTags = ['BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL', 'SPAN'];
    if (textTags.indexOf(tag) !== -1) {
      text = (el.innerText || el.textContent || '').trim().slice(0, 200) || null;
    }

    // value for form elements
    var valueTags = ['INPUT', 'SELECT', 'TEXTAREA'];
    if (valueTags.indexOf(tag) !== -1) {
      value = el.value != null ? String(el.value) : null;
    }

    // Gather all attributes as a plain object
    var attributes = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      attributes[attr.name] = attr.value;
    }

    return {
      selector: selector,
      tagName: tag,
      id: el.id || null,
      classList: Array.from(el.classList),
      attributes: attributes,
      text: text,
      value: value,
    };
  }

  // ── Post-Action Checks ───────────────────────────────────────────────

  /**
   * After an interaction, observe for URL changes or new DOM elements.
   * Returns a promise that resolves with a waitCondition object or null.
   */
  function performPostActionCheck(urlBefore) {
    return new Promise(function (resolve) {
      var result = null;

      // Check URL change immediately (for pushState that already fired)
      if (window.location.href !== urlBefore) {
        resolve({ type: 'navigation', value: window.location.href });
        return;
      }

      // Set up MutationObserver to watch for significant new elements
      var observer = null;
      var timeout = null;

      try {
        observer = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            for (var j = 0; j < m.addedNodes.length; j++) {
              var node = m.addedNodes[j];
              if (node.nodeType === Node.ELEMENT_NODE) {
                var tag = node.tagName.toUpperCase();
                // Ignore script, style, and invisible nodes
                var ignoreTags = ['SCRIPT', 'STYLE', 'LINK', 'META', 'BR', 'HR'];
                if (ignoreTags.indexOf(tag) === -1) {
                  var sel = window.__generateSelector ? window.__generateSelector(node) : tag.toLowerCase();
                  result = { type: 'selector', value: sel };
                  break;
                }
              }
            }
            if (result) break;
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });
      } catch (_) {
        // MutationObserver may not be available
      }

      timeout = setTimeout(function () {
        if (observer) observer.disconnect();

        // Final URL check
        if (!result && window.location.href !== urlBefore) {
          result = { type: 'navigation', value: window.location.href };
        }

        resolve(result);
      }, POST_ACTION_OBSERVE_MS);
    });
  }

  // ── Action Reporting ─────────────────────────────────────────────────

  /**
   * Build and send an action payload to the Node.js handler.
   */
  function reportAction(actionData) {
    if (!window.__reportInteraction) return;

    var now = Date.now();
    stepCounter++;

    var timeSinceLastAction = lastActionTimestamp ? (now - lastActionTimestamp) : 0;
    lastActionTimestamp = now;

    var payload = {
      step: stepCounter,
      type: actionData.type,
      selector: actionData.selector || null,
      url: window.location.href,
      timestamp: now,
      performance: { timeSinceLastAction: timeSinceLastAction },
      context: actionData.context || null,
      waitCondition: null,
    };

    // For navigation events, include extra fields
    if (actionData.type === 'navigation') {
      payload.context = {
        navigationMethod: actionData.navigationMethod,
        fromUrl: actionData.fromUrl,
        toUrl: actionData.toUrl,
      };
      payload.waitCondition = { type: 'navigation', value: actionData.toUrl };
    }

    window.__reportInteraction(payload);
  }

  /**
   * Handle a DOM interaction event: extract metadata, check post-action
   * state, and report.
   */
  function handleInteractionEvent(eventType, el, extraContext) {
    if (isPageLoading()) return;

    var meta = extractTargetMeta(el);
    if (!meta) return;

    var urlBefore = window.location.href;
    var now = Date.now();
    stepCounter++;

    var timeSinceLastAction = lastActionTimestamp ? (now - lastActionTimestamp) : 0;
    lastActionTimestamp = now;

    var payload = {
      step: stepCounter,
      type: eventType,
      selector: meta.selector,
      url: urlBefore,
      timestamp: now,
      performance: { timeSinceLastAction: timeSinceLastAction },
      context: {
        tagName: meta.tagName,
        id: meta.id,
        classList: meta.classList,
        attributes: meta.attributes,
        text: meta.text,
        value: meta.value,
      },
      waitCondition: null,
    };

    // Merge any extra context
    if (extraContext) {
      for (var key in extraContext) {
        if (extraContext.hasOwnProperty(key)) {
          payload.context[key] = extraContext[key];
        }
      }
    }

    // Run post-action check asynchronously, then report
    performPostActionCheck(urlBefore).then(function (waitCondition) {
      payload.waitCondition = waitCondition;
      if (window.__reportInteraction) {
        window.__reportInteraction(payload);
      }
    });
  }

  // ── Event Handlers ───────────────────────────────────────────────────

  // Click
  document.addEventListener('click', function (e) {
    var target = e.target;
    // Walk up to find the nearest interactive element if click landed on a child
    while (target && target !== document.body) {
      var tag = target.tagName.toUpperCase();
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' ||
          target.getAttribute('role') === 'button' ||
          target.getAttribute('onclick') ||
          target.hasAttribute('tabindex')) {
        break;
      }
      // If no interactive parent, stay with original target
      if (!target.parentElement || target.parentElement === document.body) break;
      target = target.parentElement;
    }
    handleInteractionEvent('click', target || e.target);
  }, { capture: true, passive: true });

  // Input (debounced per element)
  document.addEventListener('input', function (e) {
    var target = e.target;
    if (!target || !target.tagName) return;

    // Create a stable key for this element
    if (!target.__inputDebounceKey) {
      target.__inputDebounceKey = 'idk-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    }
    var key = target.__inputDebounceKey;

    if (inputDebounceTimers[key]) {
      clearTimeout(inputDebounceTimers[key]);
    }

    inputDebounceTimers[key] = setTimeout(function () {
      delete inputDebounceTimers[key];
      handleInteractionEvent('input', target);
    }, INPUT_DEBOUNCE_MS);
  }, { capture: true, passive: true });

  // Change (select, checkbox, radio)
  document.addEventListener('change', function (e) {
    var target = e.target;
    if (!target || !target.tagName) return;
    var tag = target.tagName.toUpperCase();
    // Only handle select, checkbox, radio — input is covered by input event
    if (tag === 'SELECT' || (tag === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio'))) {
      handleInteractionEvent('select', target, {
        checked: target.checked != null ? target.checked : undefined,
        selectedOption: tag === 'SELECT' ? (target.options[target.selectedIndex] || {}).text : undefined,
      });
    }
  }, { capture: true, passive: true });

  // Submit
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName.toUpperCase() !== 'FORM') return;
    handleInteractionEvent('submit', form, {
      formAction: form.action || null,
      formMethod: (form.method || 'GET').toUpperCase(),
    });
  }, { capture: true, passive: true });

  // ── Page Unload: flush pending input debounces ───────────────────────

  window.addEventListener('beforeunload', function () {
    for (var key in inputDebounceTimers) {
      if (inputDebounceTimers.hasOwnProperty(key)) {
        clearTimeout(inputDebounceTimers[key]);
      }
    }
    inputDebounceTimers = {};
  });

})();
`;
}

/**
 * Session Recorder — Precision Interaction & Error Tracker
 *
 * Launches a persistent Chromium browser context, injects the precision
 * interaction listener, captures lean action metadata, and monitors
 * console errors and network failures.
 *
 * Output: A compact Action-Chain JSON optimised for Playwright replay.
 *
 * Node.js-side responsibilities:
 *   - Console monitoring  (page.on('console'))    → errors[]
 *   - Network monitoring  (page.on('requestfailed'), page.on('response')) → errors[]
 *   - Navigation tracking (framenavigated)        → augments actions
 *   - Session metadata    (viewport, userAgent)
 */

import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getInteractionListenerSource } from './injected/interactionListener.js';

export class SessionRecorder {
  constructor(options = {}) {
    this.sessionId = uuidv4();
    this.startTime = new Date().toISOString();

    /** @type {Array<object>} Ordered list of user actions */
    this.actions = [];

    /** @type {Map<string, object>} Deduplicated errors keyed by fingerprint */
    this._errorMap = new Map();

    /** @type {object|null} Session metadata (viewport, userAgent) */
    this.metadata = null;

    this.context = null;
    this.isRecording = false;
    this.outputDir = options.outputDir || resolve('sessions');

    // Guard against overlapping interaction handling
    this._processingInteraction = false;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  /**
   * Launch the browser and start recording.
   * @param {string|null} startUrl - Optional URL to navigate to initially.
   */
  async start(startUrl) {
    const userDataDir = resolve('.browser-data');

    console.log(`\n🎬  Precision Interaction & Error Tracker starting...`);
    console.log(`    Session ID : ${this.sessionId}`);
    console.log(`    User data  : ${userDataDir}\n`);

    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: null,                // use full window size
      args: ['--start-maximized'],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    // ── Expose binding BEFORE injecting scripts ────────────────────────
    await this.context.exposeBinding(
      '__reportInteraction',
      async ({ page }, actionPayload) => {
        await this._handleAction(page, actionPayload);
      },
    );

    // ── Inject the precision interaction listener ──────────────────────
    const listenerSource = getInteractionListenerSource();
    await this.context.addInitScript({ content: listenerSource });

    // Also inject into pages already open (e.g. the default blank tab)
    for (const page of this.context.pages()) {
      await page.evaluate(listenerSource).catch(() => {});
    }

    // ── Navigate the first page ────────────────────────────────────────
    const pages = this.context.pages();
    const firstPage = pages.length > 0 ? pages[0] : await this.context.newPage();

    if (startUrl) {
      await firstPage.goto(startUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    }

    // ── Capture session metadata ───────────────────────────────────────
    this.metadata = await this._captureMetadata(firstPage);

    // ── Attach monitors to existing pages ──────────────────────────────
    for (const page of this.context.pages()) {
      this._attachPageMonitors(page);
    }

    // ── Monitor future pages ───────────────────────────────────────────
    this.context.on('page', (page) => {
      this._attachPageMonitors(page);
    });

    this.isRecording = true;

    console.log(`✅  Recorder is active. Interact with the browser to capture actions.`);
    console.log(`    Press Ctrl+C to stop recording and export the session.\n`);
  }

  /**
   * Stop recording, export session, and close the browser.
   * @returns {string} Path to the exported JSON file.
   */
  async stop() {
    if (!this.isRecording) return;
    this.isRecording = false;

    console.log(`\n⏹️   Stopping recorder...`);

    const outputPath = this._exportSession();

    try {
      await this.context.close();
    } catch (_) {
      // Browser may already be closed by the user
    }

    console.log(`\n🏁  Session complete.`);
    console.log(`    Total actions : ${this.actions.length}`);
    console.log(`    Unique errors : ${this._errorMap.size}`);
    console.log(`    Output        : ${outputPath}\n`);

    return outputPath;
  }

  // ── Page Monitors ────────────────────────────────────────────────────

  /**
   * Attach console, network, and navigation monitors to a page.
   * @param {import('playwright').Page} page
   */
  _attachPageMonitors(page) {
    // ── Console errors & warnings ──────────────────────────────────────
    page.on('console', (msg) => {
      const type = msg.type(); // 'error', 'warning', 'log', etc.
      if (type === 'error' || type === 'warning') {
        const entry = {
          type: 'console',
          level: type,
          message: msg.text(),
          url: page.url(),
        };
        const isNew = this._dedupeError(entry);
        if (isNew) {
          const icon = type === 'error' ? '🔴' : '🟡';
          console.log(`  ${icon}  Console ${type}: ${msg.text().slice(0, 120)}`);
        }
      }
    });

    // ── Failed network requests ────────────────────────────────────────
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      const entry = {
        type: 'network',
        url: request.url(),
        method: request.method(),
        status: null,
        errorText: failure ? failure.errorText : 'Unknown error',
        resourceType: request.resourceType(),
      };
      const isNew = this._dedupeError(entry);
      if (isNew) {
        console.log(`  🔴  Request failed: ${request.method()} ${request.url().slice(0, 100)}`);
      }
    });

    // ── HTTP 4xx / 5xx responses ───────────────────────────────────────
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        const entry = {
          type: 'network',
          url: response.url(),
          method: response.request().method(),
          status: status,
          statusText: response.statusText(),
          resourceType: response.request().resourceType(),
        };
        const isNew = this._dedupeError(entry);
        if (isNew) {
          console.log(`  🟠  HTTP ${status}: ${response.request().method()} ${response.url().slice(0, 100)}`);
        }
      }
    });

    // ── Navigation tracking ────────────────────────────────────────────
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        console.log(`  🔗  Navigated → ${frame.url()}`);
      }
    });

    // ── DOMContentLoaded (hard navigation marker) ──────────────────────
    page.on('domcontentloaded', () => {
      // Tag the most recent action with a hard navigation wait condition
      // if not already tagged by the injected script
      const lastAction = this.actions[this.actions.length - 1];
      if (lastAction && !lastAction.waitCondition) {
        lastAction.waitCondition = {
          type: 'navigation',
          value: page.url(),
          navigationKind: 'domcontentloaded',
        };
      }
    });
  }

  // ── Error Deduplication ──────────────────────────────────────────────

  /**
   * Deduplicate errors by fingerprint. Returns true if this is a new error.
   * @param {object} entry - Error entry.
   * @returns {boolean} Whether this was the first occurrence.
   */
  _dedupeError(entry) {
    const key = this._errorFingerprint(entry);
    const existing = this._errorMap.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
      return false;
    }

    this._errorMap.set(key, {
      ...entry,
      count: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    });
    return true;
  }

  /**
   * Generate a fingerprint key for an error entry.
   * Strips URL query params so variants of the same endpoint collapse.
   */
  _errorFingerprint(entry) {
    let urlPath = entry.url || '';
    try {
      const u = new URL(urlPath);
      urlPath = u.origin + u.pathname;
    } catch {
      // malformed URL — use as-is
    }

    if (entry.type === 'console') {
      // Console errors: dedupe by level + first 80 chars of message
      return `console|${entry.level}|${(entry.message || '').slice(0, 80)}`;
    }

    // Network errors: dedupe by method + urlPath + status/errorText
    const errSig = entry.errorText || `HTTP_${entry.status}` || 'unknown';
    return `network|${entry.method || ''}|${urlPath}|${errSig}`;
  }

  // ── Action Handling ──────────────────────────────────────────────────

  /**
   * Handle an action payload reported by the injected interaction listener.
   * @param {import('playwright').Page} page
   * @param {object} payload - Action payload from the browser.
   */
  async _handleAction(page, payload) {
    if (!this.isRecording || this._processingInteraction) return;
    this._processingInteraction = true;

    try {
      const actionIndex = this.actions.length + 1;

      // Re-number step to be sequential from the Node.js side
      payload.step = actionIndex;

      // Log to console
      const label = payload.type === 'navigation'
        ? `navigation → ${payload.context?.toUrl || payload.url}`
        : `${payload.type} → ${payload.selector || 'unknown'}`;

      console.log(`  📌  [${actionIndex}] ${label}`);

      this.actions.push(payload);
    } catch (err) {
      console.error(`  ❌  Error handling action: ${err.message}`);
    } finally {
      this._processingInteraction = false;
    }
  }

  // ── Metadata ─────────────────────────────────────────────────────────

  /**
   * Capture session-level metadata from the first page.
   * @param {import('playwright').Page} page
   * @returns {object} Metadata object.
   */
  async _captureMetadata(page) {
    let viewport = { width: 0, height: 0 };
    let userAgent = '';

    try {
      viewport = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    } catch (_) { }

    try {
      userAgent = await page.evaluate(() => navigator.userAgent);
    } catch (_) { }

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      viewport,
      userAgent,
    };
  }

  // ── Export ────────────────────────────────────────────────────────────

  /**
   * Build the Action-Chain JSON and write to disk.
   * @returns {string} Absolute path to the exported file.
   */
  _exportSession() {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }

    // Convert error Map to sorted array (highest count first)
    const errors = [...this._errorMap.values()]
      .sort((a, b) => b.count - a.count);

    const session = {
      metadata: {
        ...this.metadata,
        endTime: new Date().toISOString(),
        totalActions: this.actions.length,
        uniqueErrors: errors.length,
      },
      actions: this.actions,
      errors,
    };

    const filename = `session-${this.sessionId}.json`;
    const outputPath = join(this.outputDir, filename);

    writeFileSync(outputPath, JSON.stringify(session, null, 2), 'utf-8');

    return outputPath;
  }
}

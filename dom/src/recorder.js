/**
 * Session Recorder — Core Orchestration
 *
 * Launches a persistent Chromium browser context, injects the interaction
 * listener, captures DOM snapshots on each interaction, and exports the
 * session log as a structured JSON file.
 */

import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getInteractionListenerSource } from './injected/interactionListener.js';
import { getDomMapperSource } from './utils/domMapper.js';

export class SessionRecorder {
  constructor(options = {}) {
    this.sessionId = uuidv4();
    this.startTime = new Date().toISOString();
    this.sessionLog = [];
    this.context = null;
    this.isRecording = false;
    this.outputDir = options.outputDir || resolve('sessions');

    // Track pages to avoid duplicate binding listeners
    this._processingInteraction = false;
  }

  /**
   * Launch the browser and start recording.
   */
  async start(startUrl) {
    const userDataDir = resolve('.browser-data');

    console.log(`\n🎬  Session Recorder starting...`);
    console.log(`    Session ID : ${this.sessionId}`);
    console.log(`    User data  : ${userDataDir}\n`);

    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: null,                // use full window size
      args: ['--start-maximized'],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    // Expose the binding BEFORE adding init script so it's available immediately
    await this.context.exposeBinding('__reportInteraction', async ({ page }, metadata) => {
      await this._handleInteraction(page, metadata);
    });

    // Inject the interaction listener into every new page/frame
    const listenerSource = getInteractionListenerSource();
    await this.context.addInitScript({ content: listenerSource });

    // Also inject into any pages already open
    for (const page of this.context.pages()) {
      await page.evaluate(listenerSource).catch(() => {});
    }

    // Navigate the first page if a URL was provided
    const pages = this.context.pages();
    const firstPage = pages.length > 0 ? pages[0] : await this.context.newPage();

    if (startUrl) {
      await firstPage.goto(startUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    }

    this.isRecording = true;

    console.log(`✅  Recorder is active. Interact with the browser to capture snapshots.`);
    console.log(`    Press Ctrl+C to stop recording and export the session.\n`);

    // Log frame navigations
    this.context.on('page', (page) => {
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          console.log(`  🔗  Navigated → ${frame.url()}`);
        }
      });
    });

    // Also listen on existing pages
    for (const page of this.context.pages()) {
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          console.log(`  🔗  Navigated → ${frame.url()}`);
        }
      });
    }
  }

  /**
   * Handle an interaction signal from the injected script.
   */
  async _handleInteraction(page, metadata) {
    if (!this.isRecording || this._processingInteraction) return;
    this._processingInteraction = true;

    try {
      const interactionIndex = this.sessionLog.length + 1;
      console.log(`  📸  [${interactionIndex}] ${metadata.type} → ${metadata.targetSelector}`);

      // Small extra delay to let any async DOM updates settle (framework rendering)
      await page.waitForTimeout(50);

      // Capture DOM snapshot
      const domMapperFn = getDomMapperSource();
      const domSnapshot = await page.evaluate(domMapperFn, metadata.targetSelector).catch((err) => {
        console.warn(`  ⚠️   DOM snapshot failed: ${err.message}`);
        return null;
      });

      const resultUrl = page.url();

      this.sessionLog.push({
        interaction: {
          type: metadata.type,
          timestamp: metadata.timestamp,
          url: metadata.url,
          targetSelector: metadata.targetSelector,
          textContent: metadata.textContent,
          boundingBox: metadata.boundingBox,
          unique_id: metadata.unique_id,
          tagName: metadata.tagName,
        },
        dom_snapshot: domSnapshot,
        result_url: resultUrl,
      });

      console.log(`         ✓ Snapshot captured (result: ${resultUrl})`);
    } catch (err) {
      console.error(`  ❌  Error capturing interaction: ${err.message}`);
    } finally {
      this._processingInteraction = false;
    }
  }

  /**
   * Stop recording, export session, and close the browser.
   */
  async stop() {
    if (!this.isRecording) return;
    this.isRecording = false;

    console.log(`\n⏹️   Stopping recorder...`);

    const outputPath = this._exportSession();

    // Close the browser context
    try {
      await this.context.close();
    } catch (_) {
      // Browser may already be closed
    }

    console.log(`\n🏁  Session complete.`);
    console.log(`    Total interactions: ${this.sessionLog.length}`);
    console.log(`    Output: ${outputPath}\n`);

    return outputPath;
  }

  /**
   * Export the session log as a JSON file.
   */
  _exportSession() {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }

    const session = {
      session_id: this.sessionId,
      start_time: this.startTime,
      end_time: new Date().toISOString(),
      total_interactions: this.sessionLog.length,
      journey: this.sessionLog,
    };

    const filename = `session-${this.sessionId}.json`;
    const outputPath = join(this.outputDir, filename);

    writeFileSync(outputPath, JSON.stringify(session, null, 2), 'utf-8');

    return outputPath;
  }
}

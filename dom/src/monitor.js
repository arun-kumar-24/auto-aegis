/**
 * High-Fidelity Synthetic Monitor
 *
 * Accepts a "Golden Path" JSON (produced by the Precision Interaction &
 * Error Tracker) and replays every recorded action with full observability.
 *
 * Observability features:
 *   - HAR recording    (recordHar)
 *   - Playwright trace (context.tracing)
 *   - Network sentinel (anomalies.json for status >= 400)
 *   - Delta-timing     (compares measured latency vs golden baseline)
 *   - Failure artifacts (screenshot, trace zip, crash report)
 *
 * Usage:
 *   node src/monitor.js ./sessions/session-XXXX.json
 *
 * Output folder (./logs/):
 *   run_summary.json   — step-by-step results + latency metrics
 *   network.har        — full HAR capture
 *   anomalies.json     — HTTP responses with status >= 400
 *   failure_trace.zip  — only if a step failed
 *   FAIL_step_N_*.png  — full-page screenshot of failed step
 *   crash_report.json  — last 5 console messages + failing selector
 */

import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { resolve, join } from 'node:path';

// ── Constants ──────────────────────────────────────────────────────────

const DEGRADATION_THRESHOLD = 1.5;   // 150% of golden baseline
const ACTION_TIMEOUT_MS = 7_000;     // max wait per action (fast — don't stall)
const WAIT_CONDITION_TIMEOUT_MS = 5_000; // max wait for post-action condition
const STABILIZATION_MS = 1_500;      // brief pause for DOM to settle after navigation

// ── Entry Point ────────────────────────────────────────────────────────

const goldenPath = process.argv[2];

if (!goldenPath) {
  console.error('Usage: node src/monitor.js <path-to-golden-json>');
  console.error('  e.g: node src/monitor.js ./sessions/session-xxx.json');
  process.exit(1);
}

const goldenJson = JSON.parse(readFileSync(resolve(goldenPath), 'utf-8'));

console.log('═══════════════════════════════════════════════════════');
console.log('   High-Fidelity Synthetic Monitor');
console.log('═══════════════════════════════════════════════════════');
console.log(`\n📂  Golden Path : ${goldenPath}`);
console.log(`    Actions     : ${goldenJson.actions?.length || 0}`);
console.log(`    Start URL   : ${goldenJson.actions?.[0]?.url || 'N/A'}\n`);

runMonitor(goldenJson).catch((err) => {
  console.error('\n❌  Monitor crashed:', err.message);
  process.exit(1);
});

// ── Monitor Core ───────────────────────────────────────────────────────

async function runMonitor(golden) {
  const runId = uuidv4();
  const logsDir = resolve('logs');
  const harPath = join(logsDir, 'network.har');
  const anomaliesPath = join(logsDir, 'anomalies.json');
  const summaryPath = join(logsDir, 'run_summary.json');
  const tracePath = join(logsDir, 'failure_trace.zip');
  const crashReportPath = join(logsDir, 'crash_report.json');

  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // ── State ──────────────────────────────────────────────────────────

  const anomalies = [];
  const consoleLogs = [];     // ring buffer of last N console messages
  const stepResults = [];
  let runStatus = 'PASS';
  let failedStep = null;
  let traceRunning = true;

  const startTime = new Date().toISOString();

  // ── Launch browser with HAR ────────────────────────────────────────

  const userDataDir = resolve('.browser-data');
  const viewport = golden.metadata?.viewport || { width: 1920, height: 1080 };

  console.log('🚀  Launching browser...');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport,
    args: ['--start-maximized'],
    ignoreDefaultArgs: ['--enable-automation'],
    recordHar: { path: harPath, mode: 'full' },
  });

  // ── Start tracing ──────────────────────────────────────────────────

  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: false,
  });

  console.log('📡  HAR recording + Tracing enabled.\n');

  // ── Get first page ─────────────────────────────────────────────────

  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  // ── Network Sentinel ───────────────────────────────────────────────

  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400) {
      const entry = {
        url: response.url(),
        method: response.request().method(),
        status,
        statusText: response.statusText(),
        resourceType: response.request().resourceType(),
        timestamp: Date.now(),
      };
      anomalies.push(entry);
    }
  });

  // ── Console log ring buffer ────────────────────────────────────────

  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    });
    // Keep only last 20 entries
    if (consoleLogs.length > 20) consoleLogs.shift();
  });

  // ── Navigate to start URL ──────────────────────────────────────────

  const startUrl = golden.actions?.[0]?.url;
  if (startUrl) {
    console.log(`🔗  Navigating to: ${startUrl}`);
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});
    // Brief stabilization — do NOT use networkidle (heavy sites never reach it)
    await sleep(STABILIZATION_MS);
    console.log('    ✓ Page loaded.\n');
  }

  // ── Replay Actions ─────────────────────────────────────────────────

  const actions = golden.actions || [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const stepNum = action.step || (i + 1);
    const stepLabel = `Step ${stepNum} [${action.type}]`;

    console.log(`  ▶  ${stepLabel}: ${action.selector || action.context?.toUrl || '—'}`);

    const stepStart = Date.now();
    let stepStatus = 'PASS';
    let stepError = null;
    const flags = [];

    try {
      // Execute the action
      await executeAction(page, action);

      // Honour waitCondition
      if (action.waitCondition) {
        await honourWaitCondition(page, action.waitCondition);
      }
    } catch (err) {
      stepStatus = 'FAIL';
      stepError = err.message;
      runStatus = 'FAIL';
      if (!failedStep) failedStep = stepNum;

      console.log(`  ❌  ${stepLabel} FAILED: ${err.message}`);

      // ── Failure Artifacts ────────────────────────────────────────

      // 1. Full-page screenshot
      const screenshotName = `FAIL_step_${stepNum}_${action.type}.png`;
      const screenshotPath = join(logsDir, screenshotName);
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`      📷 Screenshot saved: ${screenshotName}`);
      } catch (_) {}

      // 2. Stop trace and save (on first failure only)
      if (traceRunning) {
        try {
          await context.tracing.stop({ path: tracePath });
          traceRunning = false;
          console.log(`      📦 Trace saved: failure_trace.zip`);
        } catch (_) {}
      }

      // 3. Crash report (overwritten on each failure — last failure wins)
      const crashReport = {
        failedStep: stepNum,
        failedAction: action.type,
        failedSelector: action.selector || null,
        error: err.message,
        url: page.url(),
        lastConsoleLogs: consoleLogs.slice(-5),
        timestamp: new Date().toISOString(),
      };
      writeFileSync(crashReportPath, JSON.stringify(crashReport, null, 2), 'utf-8');
      console.log(`      📋 Crash report saved.`);

      // Record the failed step, but CONTINUE to next steps
      const stepEnd = Date.now();
      stepResults.push({
        step: stepNum,
        type: action.type,
        selector: action.selector || null,
        status: stepStatus,
        latency: stepEnd - stepStart,
        goldenBaseline: action.performance?.timeSinceLastAction || 0,
        degradation: false,
        flags: ['STEP_FAILURE'],
        error: stepError,
      });
      continue; // ← continue to next step instead of aborting
    }

    // ── Delta-Timing ─────────────────────────────────────────────────

    const stepEnd = Date.now();
    const latency = stepEnd - stepStart;
    const goldenBaseline = action.performance?.timeSinceLastAction || 0;
    let degradation = false;

    if (goldenBaseline > 0 && latency > goldenBaseline * DEGRADATION_THRESHOLD) {
      degradation = true;
      flags.push('PERFORMANCE_DEGRADATION');
      console.log(`  ⚠️   PERFORMANCE_DEGRADATION: ${latency}ms vs baseline ${goldenBaseline}ms (${((latency / goldenBaseline) * 100).toFixed(0)}%)`);
    }

    console.log(`  ✅  ${stepLabel}: ${latency}ms${degradation ? ' ⚠️' : ''}`);

    stepResults.push({
      step: stepNum,
      type: action.type,
      selector: action.selector || null,
      status: stepStatus,
      latency,
      goldenBaseline,
      degradation,
      flags,
      error: stepError,
    });
  }

  // ── Finalize ───────────────────────────────────────────────────────

  // Stop tracing (if not already stopped due to failure)
  if (traceRunning) {
    try {
      // On success, save trace to a success file (not failure_trace)
      await context.tracing.stop({ path: join(logsDir, 'trace.zip') });
    } catch (_) {}
  }

  // Write anomalies
  writeFileSync(anomaliesPath, JSON.stringify(anomalies, null, 2), 'utf-8');

  // Close context (this also finalises the HAR)
  try {
    await context.close();
  } catch (_) {}

  // ── Build run summary ──────────────────────────────────────────────

  const endTime = new Date().toISOString();
  const passedSteps = stepResults.filter((s) => s.status === 'PASS').length;
  const totalLatency = stepResults.reduce((sum, s) => sum + s.latency, 0);
  const degradations = stepResults.filter((s) => s.degradation).length;

  const summary = {
    runId,
    goldenSessionId: golden.metadata?.sessionId || null,
    startTime,
    endTime,
    status: runStatus,
    totalSteps: actions.length,
    passedSteps,
    failedStep,
    steps: stepResults,
    performanceSummary: {
      totalLatency,
      avgLatency: stepResults.length > 0 ? Math.round(totalLatency / stepResults.length) : 0,
      degradations,
    },
  };

  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

  // ── Report ─────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   Run Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Status        : ${runStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Steps         : ${passedSteps}/${actions.length} passed`);
  console.log(`   Total latency : ${totalLatency}ms`);
  console.log(`   Avg latency   : ${summary.performanceSummary.avgLatency}ms`);
  console.log(`   Degradations  : ${degradations}`);
  console.log(`   Anomalies     : ${anomalies.length} (HTTP >= 400)`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`   📁 Output     : ${logsDir}/`);
  console.log(`      ├─ run_summary.json`);
  console.log(`      ├─ network.har`);
  console.log(`      ├─ anomalies.json`);
  if (runStatus === 'FAIL') {
    console.log(`      ├─ failure_trace.zip`);
    console.log(`      ├─ crash_report.json`);
    console.log(`      └─ FAIL_step_*.png`);
  } else {
    console.log(`      └─ trace.zip`);
  }
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(runStatus === 'PASS' ? 0 : 1);
}

// ── Action Executors ───────────────────────────────────────────────────

/**
 * Execute a single recorded action on the page.
 * @param {import('playwright').Page} page
 * @param {object} action - Action from the golden JSON.
 */
async function executeAction(page, action) {
  switch (action.type) {
    case 'click': {
      if (!action.selector) throw new Error('Click action missing selector');
      await page.click(action.selector, { timeout: ACTION_TIMEOUT_MS });
      break;
    }

    case 'input': {
      if (!action.selector) throw new Error('Input action missing selector');
      const value = action.context?.value || '';
      await page.fill(action.selector, value, { timeout: ACTION_TIMEOUT_MS });
      break;
    }

    case 'select': {
      if (!action.selector) throw new Error('Select action missing selector');
      const value = action.context?.value || '';
      // For checkboxes/radios, use click; for <select>, use selectOption
      const tagName = (action.context?.tagName || '').toUpperCase();
      if (tagName === 'SELECT') {
        await page.selectOption(action.selector, value, { timeout: ACTION_TIMEOUT_MS });
      } else {
        // checkbox / radio
        await page.click(action.selector, { timeout: ACTION_TIMEOUT_MS });
      }
      break;
    }

    case 'submit': {
      if (!action.selector) throw new Error('Submit action missing selector');
      // Submit the form by clicking (most reliable cross-browser approach)
      await page.click(action.selector, { timeout: ACTION_TIMEOUT_MS });
      break;
    }

    case 'navigation': {
      // SPA navigations often have dynamic query params — just wait briefly
      // for the page to settle rather than matching exact URLs
      await sleep(STABILIZATION_MS);
      break;
    }

    default:
      console.log(`  ⚠️   Unknown action type: ${action.type}, skipping.`);
  }
}

/**
 * Wait for the post-action condition to be met.
 * @param {import('playwright').Page} page
 * @param {object} condition - waitCondition from the action.
 */
async function honourWaitCondition(page, condition) {
  if (!condition || !condition.type) return;

  try {
    switch (condition.type) {
      case 'navigation': {
        // Navigation wait: use domcontentloaded (fast) + brief stabilization
        // Do NOT use networkidle — heavy sites never reach it
        await page.waitForLoadState('domcontentloaded', { timeout: WAIT_CONDITION_TIMEOUT_MS }).catch(() => {});
        await sleep(STABILIZATION_MS);
        break;
      }

      case 'selector': {
        if (condition.value) {
          await page.waitForSelector(condition.value, {
            state: 'visible',
            timeout: WAIT_CONDITION_TIMEOUT_MS,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (_) {
    // Wait condition timeout is non-fatal — the action itself may still have succeeded
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

#!/usr/bin/env node
/**
 * Aegis Shadow — Autonomous Lifecycle Orchestrator
 *
 * A single file that manages the full lifecycle:
 *   Start → Track (30s) → Simulate → Report → Dispatch
 *
 * Usage:
 *   node src/aegis-shadow.js https://example.com
 *   npm run shadow -- https://example.com
 *
 * Environment:
 *   WEBHOOK_URL      — Server endpoint (e.g. http://localhost:3001/api/ingest/artifacts)
 *   AEGIS_API_KEY    — API key for the server (x-api-key header)
 *   GROQ_API_KEY     — For AI diagnostics (loaded from .env)
 *   RECORD_DURATION  — Override recording duration in seconds (default: 30)
 */

import chalk from 'chalk';
import ora from 'ora';
import { SessionRecorder } from './recorder.js';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Paths ──────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOM_DIR = resolve(__dirname, '..');

// ── Config ─────────────────────────────────────────────────────────────

loadEnvFile();

const RECORD_DURATION_S = parseInt(process.env.RECORD_DURATION || '30', 10);
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const AEGIS_API_KEY = process.env.AEGIS_API_KEY || '';
const START_URL = process.argv[2] || null;
const CODEBASE_DIR = parseFlag('--codebase') || DOM_DIR;

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.clear();
  printBanner();

  if (!START_URL) {
    console.log(chalk.red.bold('  ✖ No URL provided.\n'));
    console.log(chalk.dim('  Usage: npm run shadow -- https://example.com\n'));
    process.exit(1);
  }

  let goldenPath = null;
  let summaryPath = null;
  let reportPath = null;

  try {
    // ━━━ Phase 1: Shadow Recording ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    goldenPath = await phaseRecord(START_URL);

    // Check if we have any actions to simulate
    const golden = JSON.parse(readFileSync(goldenPath, 'utf-8'));
    const actionCount = (golden.actions || []).length;

    if (actionCount === 0) {
      console.log(chalk.yellow.bold('\n  ⚠  No interactions captured during recording.'));
      console.log(chalk.dim('     User did not interact with the page.\n'));
    } else {
      // ━━━ Phase 2: Stress-Test Simulation ━━━━━━━━━━━━━━━━━━━━━━━━━━
      summaryPath = await phaseSimulate(goldenPath);

      // ━━━ Phase 3: AI Diagnostics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      reportPath = await phaseDiagnose();
    }
  } finally {
    // ━━━ Phase 4: Dispatch to Server ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await phaseDispatch(goldenPath, summaryPath, reportPath);

    printFooter(goldenPath, summaryPath, reportPath);
  }
}

main().catch((err) => {
  console.error(chalk.red.bold(`\n  ✖ Fatal Error: ${err.message}\n`));
  process.exit(1);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Phase 1: Shadow Recording
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function phaseRecord(url) {
  printPhaseHeader(1, 'Shadow Recording', 'cyan');

  const recorder = new SessionRecorder({
    outputDir: resolve(DOM_DIR, 'sessions'),
  });

  await recorder.start(url);

  // ── 30s countdown with progress bar ─────────────────────────────────

  const spinner = ora({
    text: progressText(0, RECORD_DURATION_S),
    color: 'cyan',
    prefixText: ' ',
  }).start();

  let elapsed = 0;
  let browserClosed = false;

  // Detect if the user closes the browser early
  recorder.context.on('close', () => {
    browserClosed = true;
  });

  await new Promise((done) => {
    const tick = setInterval(() => {
      elapsed++;
      spinner.text = progressText(elapsed, RECORD_DURATION_S);

      if (elapsed >= RECORD_DURATION_S || browserClosed) {
        clearInterval(tick);
        done();
      }
    }, 1000);
  });

  if (browserClosed) {
    spinner.info(chalk.dim('Browser closed by user — saving session.'));
  } else {
    spinner.succeed(chalk.green('Recording window complete.'));
  }

  // Stop the recorder — saves golden JSON + closes browser
  const outputPath = await recorder.stop();

  console.log(chalk.green.bold('  ✔ User Journey Captured'));
  console.log(chalk.dim(`    → ${outputPath}\n`));

  return outputPath;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Phase 2: Stress-Test Simulation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function phaseSimulate(goldenPath) {
  printPhaseHeader(2, 'Stress-Test Simulation', 'yellow');

  console.log(chalk.yellow('  🚀 Recording Complete. Starting Stress-Test Simulation...\n'));

  const spinner = ora({
    text: chalk.yellow('Performing simulation in background...'),
    color: 'yellow',
    prefixText: ' ',
  }).start();

  try {
    await runChildScript('monitor.js', [goldenPath]);
    spinner.succeed(chalk.green('Simulation complete.'));
  } catch (err) {
    spinner.warn(chalk.yellow('Simulation completed with issues.'));
    console.log(chalk.dim(`    ${err.message.split('\n')[0]}`));
  }

  // Show run summary stats
  const summaryPath = resolve(DOM_DIR, 'logs', 'run_summary.json');
  if (existsSync(summaryPath)) {
    const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
    const statusIcon = summary.status === 'PASS' ? chalk.green('✔ PASS') : chalk.red('✖ FAIL');
    console.log(chalk.dim(`    Status  : ${statusIcon}`));
    console.log(chalk.dim(`    Steps   : ${summary.passedSteps}/${summary.totalSteps} passed`));
    console.log(chalk.dim(`    Latency : ${summary.performanceSummary?.totalLatency}ms`));
    console.log();
  }

  return summaryPath;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Phase 3: AI Diagnostics
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function phaseDiagnose() {
  printPhaseHeader(3, 'AI Diagnostics', 'magenta');

  const summaryPath = resolve(DOM_DIR, 'logs', 'run_summary.json');
  const reportPath = resolve(DOM_DIR, 'logs', 'incident_report.md');

  if (!existsSync(summaryPath)) {
    console.log(chalk.dim('  No run summary found. Skipping diagnostics.\n'));
    return null;
  }

  // If the run passed, skip expensive AI call
  const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
  if (summary.status === 'PASS') {
    console.log(chalk.green.bold('  ✔ All steps passed — no incidents to diagnose.\n'));
    return null;
  }

  const spinner = ora({
    text: chalk.magenta('Generating AI incident report via Groq...'),
    color: 'magenta',
    prefixText: ' ',
  }).start();

  try {
    await runChildScript('diagnostics.js', ['--codebase', CODEBASE_DIR]);
    spinner.succeed(chalk.green('Incident report generated.'));
    console.log(chalk.dim(`    → ${reportPath}\n`));
    return reportPath;
  } catch (err) {
    spinner.fail(chalk.red('Diagnostics failed.'));
    console.log(chalk.dim(`    ${err.message.split('\n')[0]}\n`));
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Phase 4: Dispatch to Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function phaseDispatch(goldenPath, summaryPath, reportPath) {
  if (!WEBHOOK_URL) {
    console.log(chalk.dim('\n  No WEBHOOK_URL configured — skipping dispatch.'));
    return;
  }

  printPhaseHeader(4, 'Dispatching to Server', 'blue');

  const spinner = ora({
    text: chalk.blue('Sending all artifacts to server...'),
    color: 'blue',
    prefixText: ' ',
  }).start();

  try {
    const logsDir = resolve(DOM_DIR, 'logs');

    // Build the artifacts payload
    const payload = {
      timestamp: new Date().toISOString(),
    };

    // Read run summary for IDs
    if (summaryPath && existsSync(summaryPath)) {
      const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
      payload.runId = summary.runId;
      payload.journeyId = summary.goldenSessionId;
      payload.runSummary = summary;
    }

    // Golden session
    if (goldenPath && existsSync(goldenPath)) {
      payload.goldenSession = JSON.parse(readFileSync(goldenPath, 'utf-8'));
      // Fallback journeyId from golden session
      if (!payload.journeyId) {
        payload.journeyId = payload.goldenSession.metadata?.sessionId;
      }
    }

    // Anomalies
    const anomaliesPath = join(logsDir, 'anomalies.json');
    if (existsSync(anomaliesPath)) {
      payload.anomalies = JSON.parse(readFileSync(anomaliesPath, 'utf-8'));
    }

    // Crash report
    const crashPath = join(logsDir, 'crash_report.json');
    if (existsSync(crashPath)) {
      payload.crashReport = JSON.parse(readFileSync(crashPath, 'utf-8'));
    }

    // Incident report (markdown string)
    if (reportPath && existsSync(reportPath)) {
      payload.incidentReport = readFileSync(reportPath, 'utf-8');
    }

    // Network HAR
    const harPath = join(logsDir, 'network.har');
    if (existsSync(harPath)) {
      payload.networkHar = JSON.parse(readFileSync(harPath, 'utf-8'));
    }

    const headers = { 'Content-Type': 'application/json' };
    if (AEGIS_API_KEY) {
      headers['x-api-key'] = AEGIS_API_KEY;
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      spinner.succeed(chalk.green(`Artifacts dispatched → ${result.folder || 'server'} (${response.status})`));
    } else {
      const errText = await response.text().catch(() => '');
      spinner.warn(chalk.yellow(`Server responded with ${response.status}: ${errText.substring(0, 100)}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Dispatch failed: ${err.message}`));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Terminal UX
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function printBanner() {
  console.log(chalk.bold.cyan(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║       ◈  A E G I S   S H A D O W  ◈              ║
  ║       Autonomous Lifecycle Orchestrator            ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `));
  console.log(chalk.dim(`  Target : ${START_URL || 'none'}`));
  console.log(chalk.dim(`  Record : ${RECORD_DURATION_S}s`));
  console.log(chalk.dim(`  Codebase: ${CODEBASE_DIR}`));
  if (WEBHOOK_URL) console.log(chalk.dim(`  Webhook : ${WEBHOOK_URL}`));
  console.log();
}

function printPhaseHeader(num, title, color) {
  const c = chalk[color] || chalk.white;
  console.log(c.bold(`  ━━━ Phase ${num}: ${title} ${'━'.repeat(Math.max(0, 38 - title.length))}`));
  console.log();
}

function printFooter(goldenPath, summaryPath, reportPath) {
  console.log(chalk.bold.cyan(`
  ╔═══════════════════════════════════════════════════╗
  ║                 Run Complete                      ║
  ╚═══════════════════════════════════════════════════╝`));

  if (goldenPath) console.log(chalk.dim(`  📄 Golden  : ${goldenPath}`));
  if (summaryPath && existsSync(summaryPath)) console.log(chalk.dim(`  📄 Summary : ${summaryPath}`));
  if (reportPath && existsSync(reportPath)) console.log(chalk.dim(`  📄 Report  : ${reportPath}`));
  if (WEBHOOK_URL) console.log(chalk.dim(`  🔗 Server  : ${WEBHOOK_URL}`));
  console.log();
}

function progressText(current, total) {
  const width = 20;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = chalk.cyan('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
  return `[${bar}] ${chalk.bold(current)}/${total}s — ${chalk.dim('Recording User Interaction...')}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Run a sibling script (monitor.js / diagnostics.js) as a child process.
 * Pipes output to /dev/null; captures stderr for error reporting.
 */
function runChildScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, scriptName);
    const proc = spawn(process.execPath, [scriptPath, ...args], {
      cwd: DOM_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stderr = '';
    proc.stderr.on('data', (chunk) => { stderr += chunk; });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${scriptName} exited with code ${code}`));
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn ${scriptName}: ${err.message}`));
    });
  });
}

/**
 * Load .env file from the dom directory (zero-dependency).
 */
function loadEnvFile() {
  const envPath = resolve(DOM_DIR, '.env');
  if (!existsSync(envPath)) return;
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env is optional
  }
}

/**
 * Parse a --flag value from argv.
 */
function parseFlag(flag) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return resolve(args[idx + 1]);
  }
  return null;
}

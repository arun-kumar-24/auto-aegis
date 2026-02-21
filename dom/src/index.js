/**
 * Entry Point — Precision Interaction & Error Tracker
 *
 * Starts the recorder and handles graceful shutdown via SIGINT (Ctrl+C).
 *
 * Usage:
 *   node src/index.js                    # Opens blank browser
 *   node src/index.js https://example.com # Opens specific URL
 */

import { SessionRecorder } from './recorder.js';

const recorder = new SessionRecorder({
  outputDir: './sessions',
});

// ── Graceful shutdown ──────────────────────────────────────────────────

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  try {
    await recorder.stop();
  } catch (err) {
    console.error('Error during shutdown:', err.message);
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', async (err) => {
  console.error('\n❌  Uncaught exception:', err.message);
  await shutdown();
});

process.on('unhandledRejection', async (reason) => {
  console.error('\n❌  Unhandled rejection:', reason);
  await shutdown();
});

// ── Start ──────────────────────────────────────────────────────────────

const startUrl = process.argv[2] || null;

console.log('═══════════════════════════════════════════════════════');
console.log('   Precision Interaction & Error Tracker');
console.log('═══════════════════════════════════════════════════════');

recorder.start(startUrl).catch(async (err) => {
  console.error('Failed to start recorder:', err.message);
  process.exit(1);
});

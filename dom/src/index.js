/**
 * Entry Point — Event-Driven DOM Session Recorder
 *
 * Starts the recorder and handles graceful shutdown via SIGINT (Ctrl+C).
 */

import { SessionRecorder } from './recorder.js';

const recorder = new SessionRecorder({
  outputDir: './sessions',
});

// Graceful shutdown on Ctrl+C
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

// Handle uncaught errors gracefully
process.on('uncaughtException', async (err) => {
  console.error('\n❌  Uncaught exception:', err.message);
  await shutdown();
});

process.on('unhandledRejection', async (reason) => {
  console.error('\n❌  Unhandled rejection:', reason);
  await shutdown();
});

// Start the recorder
// Pass a URL from the command line, or default to about:blank
const startUrl = process.argv[2] || null;

console.log('═══════════════════════════════════════════════════════');
console.log('   Event-Driven DOM Session Recorder');
console.log('═══════════════════════════════════════════════════════');

recorder.start(startUrl).catch(async (err) => {
  console.error('Failed to start recorder:', err.message);
  process.exit(1);
});

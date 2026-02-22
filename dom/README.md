# auto-aegis

Autonomous synthetic monitoring — record user journeys, replay with observability, diagnose failures with AI, and dispatch reports to your endpoint.

## Install

```bash
npm install auto-aegis
```

> **Requires Node.js ≥ 18** (uses native `fetch`).
> Playwright browsers are installed automatically on first run.

## Quick Start — Shadow Mode (Zero Manual Steps)

```bash
npx aegis-shadow https://your-app.com
```

This single command runs the full lifecycle:

| Phase | What Happens |
|-------|---|
| 1. **Record** (30s) | Opens headed Chromium, captures user interactions with a live progress bar |
| 2. **Simulate** | Replays the golden recording with HAR capture, console/network sentinels, latency comparison |
| 3. **Diagnose** | AI-powered root cause analysis via Groq LLM (skipped if PASS) |
| 4. **Dispatch** | POSTs `run_summary` + `incident_report` to your endpoint |

### Configuration (.env)

```env
GROQ_API_KEY=gsk_your_key_here      # Required for AI diagnostics
WEBHOOK_URL=https://api.example.com   # Optional — auto-POST results here
RECORD_DURATION=30                    # Optional — recording time in seconds
```

## Programmatic Usage

```js
import { SessionRecorder } from 'auto-aegis/recorder';

const recorder = new SessionRecorder({
  outputDir: './my-sessions',
});

await recorder.start('https://your-app.com');
// ... user interacts ...
const sessionPath = await recorder.stop();
console.log('Session saved to:', sessionPath);
```

## CLI Commands

```bash
# Full autonomous pipeline
npx aegis-shadow https://your-app.com

# Individual tools
npx aegis-monitor ./sessions/golden.json    # Replay + observe
npx aegis-diagnose --logs-dir ./logs        # AI analysis
npx aegis-diagnose --codebase ./src         # AI analysis with file-level mapping
```

## Output Files

| File | Contents |
|---|---|
| `sessions/session-*.json` | Golden recording (actions + deduplicated errors) |
| `logs/run_summary.json` | Step-by-step pass/fail with latency data |
| `logs/anomalies.json` | HTTP ≥ 400 responses during replay |
| `logs/crash_report.json` | Console errors + failing selectors |
| `logs/network.har` | Full HAR network trace |
| `logs/incident_report.md` | AI-generated incident analysis |

## License

MIT

/**
 * AI-Powered Incident Diagnostics
 *
 * Reads the output artifacts from a failed Synthetic Monitor run and
 * generates a structured incident report using the Groq LLM API.
 *
 * Reads:
 *   ./logs/run_summary.json   — step-by-step results
 *   ./logs/anomalies.json     — HTTP >= 400 during the run
 *   ./logs/crash_report.json  — console logs + failing selector
 *
 * Outputs:
 *   ./logs/incident_report.md — AI-generated incident analysis
 *
 * Usage:
 *   node src/diagnostics.js
 *   node src/diagnostics.js --logs-dir ./custom-logs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Load .env file (simple loader — no dependency needed)
loadEnvFile();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.error('❌  GROQ_API_KEY not set. Create a .env file with: GROQ_API_KEY=your_key');
  process.exit(1);
}

// ── Entry Point ────────────────────────────────────────────────────────

const logsDir = parseLogsDir();

console.log('═══════════════════════════════════════════════════════');
console.log('   AI Incident Diagnostics');
console.log('═══════════════════════════════════════════════════════');
console.log(`\n📂  Logs directory : ${logsDir}\n`);

runDiagnostics(logsDir).catch((err) => {
  console.error('\n❌  Diagnostics failed:', err.message);
  process.exit(1);
});

// ── Core ───────────────────────────────────────────────────────────────

async function runDiagnostics(dir) {
  // ── Task 1: Log Aggregation ──────────────────────────────────────

  console.log('📋  Aggregating logs...');

  const runSummary = readJsonSafe(join(dir, 'run_summary.json'));
  const anomalies = readJsonSafe(join(dir, 'anomalies.json'));
  const crashReport = readJsonSafe(join(dir, 'crash_report.json'));

  if (!runSummary) {
    throw new Error('run_summary.json not found in logs directory. Run the monitor first.');
  }

  // Summarise for the LLM (trim to avoid token bloat)
  const logBundle = buildLogBundle(runSummary, anomalies, crashReport);

  const status = runSummary.status || 'UNKNOWN';
  const failedSteps = (runSummary.steps || []).filter((s) => s.status === 'FAIL');

  console.log(`    Status       : ${status}`);
  console.log(`    Failed steps : ${failedSteps.length}`);
  console.log(`    Anomalies    : ${(anomalies || []).length}`);
  console.log(`    Crash report : ${crashReport ? 'present' : 'absent'}\n`);

  if (status === 'PASS' && failedSteps.length === 0) {
    console.log('✅  Run was successful — no incident to diagnose.');
    writeSuccessReport(dir, runSummary);
    return;
  }

  // ── Task 2: AI Analysis ──────────────────────────────────────────

  console.log('🤖  Sending logs to Groq LLM for analysis...');

  const aiResponse = await callGroqAPI(logBundle);

  console.log('    ✓ Response received.\n');

  // ── Task 3: Generate Report ──────────────────────────────────────

  const reportPath = join(dir, 'incident_report.md');
  const report = formatIncidentReport(runSummary, aiResponse);

  writeFileSync(reportPath, report, 'utf-8');

  console.log('═══════════════════════════════════════════════════════');
  console.log('   Incident Report Generated');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   📄 File : ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

// ── Log Bundle Builder ─────────────────────────────────────────────────

function buildLogBundle(runSummary, anomalies, crashReport) {
  const sections = [];

  // Run summary (compact)
  sections.push('## RUN SUMMARY');
  sections.push(`Status: ${runSummary.status}`);
  sections.push(`Total steps: ${runSummary.totalSteps}, Passed: ${runSummary.passedSteps}, Failed step: ${runSummary.failedStep || 'none'}`);
  sections.push(`Total latency: ${runSummary.performanceSummary?.totalLatency}ms, Avg: ${runSummary.performanceSummary?.avgLatency}ms`);
  sections.push(`Degradations: ${runSummary.performanceSummary?.degradations}`);
  sections.push('');

  // Step details
  sections.push('## STEP DETAILS');
  for (const step of (runSummary.steps || [])) {
    const flags = step.flags?.length > 0 ? ` [${step.flags.join(', ')}]` : '';
    sections.push(`Step ${step.step} (${step.type}): ${step.status} | selector="${step.selector || 'N/A'}" | latency=${step.latency}ms | baseline=${step.goldenBaseline}ms${flags}`);
    if (step.error) {
      // Truncate long Playwright error messages
      const shortError = step.error.split('\n').slice(0, 3).join(' ').substring(0, 300);
      sections.push(`  Error: ${shortError}`);
    }
  }
  sections.push('');

  // Anomalies (top 20, deduped by URL pattern)
  if (anomalies && anomalies.length > 0) {
    sections.push('## NETWORK ANOMALIES (HTTP >= 400)');
    const deduped = dedupeAnomalies(anomalies);
    for (const a of deduped.slice(0, 20)) {
      sections.push(`  ${a.method} ${a.status} ${a.url.substring(0, 120)}${a.count > 1 ? ` (x${a.count})` : ''}`);
    }
    sections.push(`  Total anomalies: ${anomalies.length}`);
    sections.push('');
  }

  // Crash report
  if (crashReport) {
    sections.push('## CRASH REPORT');
    sections.push(`Failed step: ${crashReport.failedStep} (${crashReport.failedAction})`);
    sections.push(`Selector: ${crashReport.failedSelector || 'N/A'}`);
    sections.push(`Error: ${(crashReport.error || '').substring(0, 300)}`);
    sections.push(`Page URL: ${crashReport.url || 'N/A'}`);
    if (crashReport.lastConsoleLogs?.length > 0) {
      sections.push('Last console logs:');
      for (const log of crashReport.lastConsoleLogs) {
        sections.push(`  [${log.type}] ${(log.text || '').substring(0, 200)}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

function dedupeAnomalies(anomalies) {
  const map = new Map();
  for (const a of anomalies) {
    // Group by method + status + URL path (ignore query params)
    let urlKey;
    try {
      const u = new URL(a.url);
      urlKey = u.origin + u.pathname;
    } catch {
      urlKey = a.url;
    }
    const key = `${a.method}|${a.status}|${urlKey}`;
    if (map.has(key)) {
      map.get(key).count++;
    } else {
      map.set(key, { ...a, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

// ── Groq API Call ──────────────────────────────────────────────────────

async function callGroqAPI(logBundle) {
  const systemPrompt = `You are an SRE Agent. Analyze the provided synthetic monitoring logs. Your goal is to:

1. **Root Cause Analysis**: Identify the root cause. Is it a UI change (selector no longer exists), a backend timeout, an authentication failure, a network issue, or a flaky test? Be specific.

2. **Business Impact**: Based on the step name and action type (e.g., 'click on checkout', 'navigate to cart'), estimate the user-facing impact. Use severity levels: P0-Critical (revenue loss), P1-High (major feature broken), P2-Medium (degraded experience), P3-Low (cosmetic/minor).

3. **Actionable Fix**: Suggest exactly what the developer should check. Be specific — mention selectors, endpoints, or page elements. Provide 2-3 concrete next steps.

4. **Executive Summary**: Write a 2-sentence summary for a non-technical manager.

5. **Confidence Score**: Rate your confidence in the root cause analysis from 0-100%. Explain briefly why.

Format your response in clean Markdown with the exact section headers: ## Root Cause Analysis, ## Business Impact, ## Actionable Fix, ## Executive Summary, ## Confidence Score`;

  const userPrompt = `Here are the synthetic monitoring logs from a failed run:\n\n${logBundle}`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response from LLM.';
}

// ── Report Formatter ───────────────────────────────────────────────────

function formatIncidentReport(runSummary, aiAnalysis) {
  const now = new Date().toISOString();
  const failedSteps = (runSummary.steps || []).filter((s) => s.status === 'FAIL');

  const lines = [
    '# 🚨 Incident Report',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| **Run ID** | \`${runSummary.runId}\` |`,
    `| **Golden Session** | \`${runSummary.goldenSessionId || 'N/A'}\` |`,
    `| **Status** | ❌ **${runSummary.status}** |`,
    `| **Generated** | ${now} |`,
    `| **Steps Passed** | ${runSummary.passedSteps} / ${runSummary.totalSteps} |`,
    `| **First Failed Step** | Step ${runSummary.failedStep || 'N/A'} |`,
    `| **Total Latency** | ${runSummary.performanceSummary?.totalLatency}ms |`,
    `| **Degradations** | ${runSummary.performanceSummary?.degradations} |`,
    '',
    '---',
    '',
  ];

  // Step-by-step results table
  lines.push('## Step Results');
  lines.push('');
  lines.push('| Step | Type | Selector | Status | Latency | Flags |');
  lines.push('|------|------|----------|--------|---------|-------|');

  for (const step of (runSummary.steps || [])) {
    const sel = step.selector ? `\`${step.selector.substring(0, 50)}\`` : '—';
    const status = step.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const flags = step.flags?.join(', ') || '—';
    lines.push(`| ${step.step} | ${step.type} | ${sel} | ${status} | ${step.latency}ms | ${flags} |`);
  }

  lines.push('');

  // Error details for failed steps
  if (failedSteps.length > 0) {
    lines.push('### Failure Details');
    lines.push('');
    for (const step of failedSteps) {
      lines.push(`**Step ${step.step} (${step.type})**:`);
      lines.push('```');
      lines.push(step.error || 'No error message captured');
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');

  // AI analysis
  lines.push('## 🤖 AI Analysis');
  lines.push('');
  lines.push(aiAnalysis);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*Report generated by Auto-Aegis AI Diagnostics*');
  lines.push('');

  return lines.join('\n');
}

// ── Success Report (when run passed) ───────────────────────────────────

function writeSuccessReport(dir, runSummary) {
  const report = [
    '# ✅ Monitoring Run — All Clear',
    '',
    `**Run ID**: \`${runSummary.runId}\``,
    `**Status**: PASS`,
    `**Steps**: ${runSummary.passedSteps}/${runSummary.totalSteps} passed`,
    `**Total Latency**: ${runSummary.performanceSummary?.totalLatency}ms`,
    `**Degradations**: ${runSummary.performanceSummary?.degradations}`,
    '',
    'No incidents detected. All steps completed successfully.',
    '',
  ].join('\n');

  const reportPath = join(dir, 'incident_report.md');
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`📄  Report saved: ${reportPath}`);
}

// ── Helpers ────────────────────────────────────────────────────────────

function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function parseLogsDir() {
  const args = process.argv.slice(2);
  const dirFlagIdx = args.indexOf('--logs-dir');
  if (dirFlagIdx !== -1 && args[dirFlagIdx + 1]) {
    return resolve(args[dirFlagIdx + 1]);
  }
  return resolve('logs');
}

function loadEnvFile() {
  const envPath = resolve('.env');
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
    // .env file is optional
  }
}

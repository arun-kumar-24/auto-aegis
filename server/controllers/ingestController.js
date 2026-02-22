import { supabase } from '../lib/supabase.js';

export const ingestJourney = async (req, res) => {
    const { payload } = req.body;
    const monitorId = req.monitor.id;

    if (!payload) {
        return res.status(400).json({ error: 'Payload is required' });
    }

    try {
        const { data, error } = await supabase
            .from('journey_logs')
            .insert([{
                monitor_id: monitorId,
                payload
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Journey log captured', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const ingestSynthetic = async (req, res) => {
    const { status, response_time_ms, evidence, error_message } = req.body;
    const monitorId = req.monitor.id;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PASS', 'FAIL', 'DEGRADED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be PASS, FAIL, or DEGRADED' });
    }

    try {
        const { data, error } = await supabase
            .from('synthetic_results')
            .insert([{
                monitor_id: monitorId,
                status,
                response_time_ms,
                evidence,
                error_message
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Synthetic result logged', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Artifact Ingestion (Supabase Storage) ──────────────────────────────

const BUCKET = process.env.SUPABASE_BUCKET || 'aegis-reports';

/**
 * POST /api/ingest/artifacts
 *
 * Receives all session artifacts from the aegis-shadow CLI and uploads
 * each to Supabase Storage under: {monitorId}_{journeyId}/
 *
 * Expected JSON body:
 * {
 *   runId:           "uuid",
 *   journeyId:       "uuid",
 *   goldenSession:   { ... },
 *   runSummary:      { ... },
 *   anomalies:       [ ... ],
 *   crashReport:     { ... },
 *   incidentReport:  "# markdown...",
 *   networkHar:      { ... }
 * }
 */
export const ingestArtifacts = async (req, res) => {
    const monitorId = req.monitor.id;
    const {
        runId,
        journeyId,
        goldenSession,
        runSummary,
        anomalies,
        crashReport,
        incidentReport,
        networkHar,
    } = req.body;

    if (!runId || !journeyId) {
        return res.status(400).json({ error: 'runId and journeyId are required' });
    }

    const folder = `${monitorId}_${journeyId}`;
    const uploaded = [];
    const storageErrors = [];
    let journeyLogId = null;

    // ── Helper: upload a single artifact to Supabase Storage ──────────
    async function uploadArtifact(name, content, contentType = 'application/json') {
        if (content == null) return;

        const filePath = `${folder}/${name}`;
        const body = contentType === 'application/json'
            ? JSON.stringify(content, null, 2)
            : content;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, Buffer.from(body, 'utf-8'), {
                contentType,
                upsert: true,
            });

        if (error) {
            storageErrors.push({ file: name, error: error.message });
        } else {
            uploaded.push(name);
        }
    }

    try {
        // ── Step 1: Insert journey_logs row ───────────────────────────
        // Stores the full golden session payload for LLM processing later.
        // The `processed_by_llm` flag defaults to false so the pipeline
        // can pick up unprocessed journeys.
        if (goldenSession) {
            const { data: journeyLog, error: journeyErr } = await supabase
                .from('journey_logs')
                .insert([{
                    monitor_id: monitorId,
                    payload: {
                        runId,
                        journeyId,
                        goldenSession,
                        runSummary: runSummary || null,
                        anomalies: anomalies || null,
                        crashReport: crashReport || null,
                    },
                    // processed_by_llm defaults to false in the DB
                }])
                .select('id')
                .single();

            if (journeyErr) {
                console.error('journey_logs insert error:', journeyErr.message);
            } else {
                journeyLogId = journeyLog.id;
            }
        }

        // ── Step 2: Upload all artifacts to Supabase Storage ──────────
        await Promise.all([
            uploadArtifact('golden_session.json', goldenSession),
            uploadArtifact('run_summary.json', runSummary),
            uploadArtifact('anomalies.json', anomalies),
            uploadArtifact('crash_report.json', crashReport),
            uploadArtifact('incident_report.md', incidentReport, 'text/markdown'),
            uploadArtifact('network.har', networkHar),
        ]);

        // ── Step 3: Insert synthetic_results row for dashboard ────────
        if (runSummary) {
            const { error: syntheticErr } = await supabase
                .from('synthetic_results')
                .insert([{
                    monitor_id: monitorId,
                    status: runSummary.status || 'UNKNOWN',
                    response_time_ms: runSummary.performanceSummary?.totalLatency || 0,
                    evidence: {
                        runId,
                        journeyId,
                        folder,
                        journeyLogId,
                        artifactFiles: uploaded,
                    },
                    error_message: runSummary.failedStep
                        ? `Step ${runSummary.failedStep} failed`
                        : null,
                }]);

            if (syntheticErr) {
                console.error('synthetic_results insert error:', syntheticErr.message);
            }
        }

        // ── Response ──────────────────────────────────────────────────
        res.status(201).json({
            message: 'Artifacts ingested',
            journeyLogId,
            folder: `${BUCKET}/${folder}`,
            uploaded,
            errors: storageErrors,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

import { supabase } from '../lib/supabase.js';

const BUCKET = 'journey_bckt';

/**
 * GET /api/monitors/:id/journey-files
 *
 * 1. Find the latest journey_log for the given monitor
 * 2. Build folder name  →  {monitor_id}_{journey_id}
 * 3. List every file in that folder inside the journey_bckt bucket
 * 4. Return signed URLs (valid 1 hour) so the client can render & download
 */
export const getLatestJourneyFiles = async (req, res) => {
    const monitorId = req.params.id;

    try {
        /* ── 1. Latest journey log ──────────────────────────────── */
        const { data: journey, error: jErr } = await supabase
            .from('journey_logs')
            .select('id, created_at')
            .eq('monitor_id', monitorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (jErr || !journey) {
            return res.json({
                journeyId: null,
                folderName: null,
                files: [],
                message: 'No journey logs found for this monitor.',
            });
        }

        const folderName = `${monitorId}_${journey.id}`;

        /* ── 2. List files in the folder ────────────────────────── */
        const { data: objects, error: listErr } = await supabase
            .storage
            .from(BUCKET)
            .list(folderName, {
                limit: 200,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (listErr) throw listErr;

        // Filter out any placeholder / empty-name entries
        const realFiles = (objects || []).filter((f) => f.name && f.name !== '.emptyFolderPlaceholder');

        if (realFiles.length === 0) {
            return res.json({
                journeyId: journey.id,
                folderName,
                files: [],
                message: 'Folder exists but contains no files.',
            });
        }

        /* ── 3. Generate signed URLs (1 hr expiry) ─────────────── */
        const filePaths = realFiles.map((f) => `${folderName}/${f.name}`);

        const { data: signedData, error: signErr } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrls(filePaths, 3600); // 1 hour

        if (signErr) throw signErr;

        const files = realFiles.map((f, i) => ({
            name: f.name,
            size: f.metadata?.size ?? null,
            mimeType: f.metadata?.mimetype ?? null,
            signedUrl: signedData?.[i]?.signedUrl ?? null,
        }));

        return res.json({
            journeyId: journey.id,
            folderName,
            files,
        });
    } catch (err) {
        console.error('[journeyController] error:', err);
        return res.status(500).json({ error: err.message });
    }
};

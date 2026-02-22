import { supabase } from '../lib/supabase.js';

const BUCKET = 'journey_bckt';
const FOLDER = 'logs';

/**
 * GET /api/monitors/:id/journey-files
 *
 * Lists every file inside  journey_bckt/logs  and returns signed URLs.
 */
export const getLatestJourneyFiles = async (req, res) => {
    try {
        /* ── 1. List files in the logs folder ───────────────────── */
        const { data: objects, error: listErr } = await supabase
            .storage
            .from(BUCKET)
            .list(FOLDER, {
                limit: 200,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (listErr) throw listErr;

        // Filter out any placeholder / empty-name entries
        const realFiles = (objects || []).filter((f) => f.name && f.name !== '.emptyFolderPlaceholder');

        if (realFiles.length === 0) {
            return res.json({
                folderName: FOLDER,
                files: [],
                message: 'Folder exists but contains no files.',
            });
        }

        /* ── 2. Generate signed URLs (1 hr expiry) ─────────────── */
        const filePaths = realFiles.map((f) => `${FOLDER}/${f.name}`);

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
            folderName: FOLDER,
            files,
        });
    } catch (err) {
        console.error('[journeyController] error:', err);
        return res.status(500).json({ error: err.message });
    }
};

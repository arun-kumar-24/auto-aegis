import { WebClient } from '@slack/web-api';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL = process.env.SLACK_CHANNEL_ID;

const BUCKET = 'journey_bckt';
const FOLDER = 'logs';

/**
 * Fetch the first PNG image from the journey bucket and return a signed URL.
 */
async function getFirstPngUrl() {
    try {
        const { data: objects, error } = await supabase
            .storage
            .from(BUCKET)
            .list(FOLDER, { limit: 200, sortBy: { column: 'name', order: 'asc' } });

        if (error || !objects?.length) return null;

        const pngFile = objects.find((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f.name));
        if (!pngFile) return null;

        const { data: signed, error: signErr } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrl(`${FOLDER}/${pngFile.name}`, 3600);

        if (signErr || !signed?.signedUrl) return null;
        return { url: signed.signedUrl, name: pngFile.name };
    } catch {
        return null;
    }
}

/**
 * POST /api/alerts/slack
 *
 * Body: { region, latency, threshold, monitorName, originLocation, imageUrl? }
 *
 * Sends a formatted Slack alert when a latency spike is detected.
 * Automatically attaches any PNG found in the journey logs bucket.
 */
export const sendSlackAlert = async (req, res) => {
    const { region, latency, threshold = 100, monitorName, originLocation, imageUrl } = req.body;

    if (!region || latency == null) {
        return res.status(400).json({ error: 'region and latency are required' });
    }

    try {
        const emoji = latency >= 200 ? ':rotating_light:' : ':warning:';
        const severity = latency >= 200 ? 'CRITICAL' : 'HIGH';

        // Resolve image: use provided URL or auto-fetch from bucket
        let imgData = null;
        if (imageUrl) {
            imgData = { url: imageUrl, name: 'attachment' };
        } else {
            imgData = await getFirstPngUrl();
        }

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `${emoji} Latency Alert — ${severity}`,
                    emoji: true,
                },
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Monitor:*\n${monitorName || 'N/A'}`,
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Origin:*\n${originLocation || 'N/A'}`,
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Affected Region:*\n${region}`,
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Latency:*\n\`${latency}ms\` (threshold: ${threshold}ms)`,
                    },
                ],
            },
        ];

        // Attach image block if we have a PNG
        if (imgData?.url) {
            blocks.push({
                type: 'image',
                image_url: imgData.url,
                alt_text: `Journey log: ${imgData.name}`,
            });
        }

        blocks.push({
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `AutoAegis • Latency Visualisation Alert • ${new Date().toISOString()}`,
                },
            ],
        });

        const result = await slack.chat.postMessage({
            channel: CHANNEL,
            text: `${emoji} Latency spike detected: ${region} → ${latency}ms`,
            blocks,
        });

        return res.json({
            ok: true,
            ts: result.ts,
            channel: result.channel,
        });
    } catch (err) {
        console.error('[slackController] error:', err?.data || err.message);
        return res.status(500).json({ error: err?.data?.error || err.message });
    }
};

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getJourneyFiles } from '../services/api';

/**
 * IncidentLog — lives inside the MonitorDetailPopup (Quadrant 4).
 *
 * Flow:
 *  1. Fetch the latest journey_log for the monitor
 *  2. List files from  journey_bckt / {monitorId}_{journeyId}
 *  3. Render a file-switcher bar + scrollable content viewer + download btn
 */
export default function IncidentLog({ monitorId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [folderName, setFolderName] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [contentLoading, setContentLoading] = useState(false);

    /* ── Fetch file list on mount ───────────────────────────── */
    useEffect(() => {
        if (!monitorId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        getJourneyFiles(monitorId)
            .then((data) => {
                if (cancelled) return;
                setFiles(data.files || []);
                setFolderName(data.folderName);
                // Auto-select first file
                if (data.files?.length) {
                    setSelectedFile(data.files[0]);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.response?.data?.error || err.message || 'Failed to load files');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [monitorId]);

    /* ── Fetch selected file content ────────────────────────── */
    const fetchContent = useCallback(async (file) => {
        if (!file?.signedUrl) return;
        setContentLoading(true);
        setFileContent('');
        try {
            const res = await fetch(file.signedUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            setFileContent(text);
        } catch (err) {
            setFileContent(`⚠ Failed to load file: ${err.message}`);
        } finally {
            setContentLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedFile) fetchContent(selectedFile);
    }, [selectedFile, fetchContent]);

    /* ── Download helper ────────────────────────────────────── */
    const handleDownload = (file) => {
        if (!file?.signedUrl) return;
        const a = document.createElement('a');
        a.href = file.signedUrl;
        a.download = file.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    /* ── Determine if the file looks like markdown ──────────── */
    const isMarkdown = (name) => /\.(md|mdx|markdown)$/i.test(name || '');

    /* ── Render states ──────────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={28} className="animate-spin text-violet-400" />
                <p className="text-xs text-gray-500 font-medium">Loading journey files…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <AlertCircle size={28} className="text-red-400" />
                <p className="text-sm text-red-300 font-semibold">Error</p>
                <p className="text-xs text-gray-500">{error}</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <FolderOpen size={28} className="text-gray-600" />
                <p className="text-sm font-bold text-gray-400">No Journey Files</p>
                <p className="text-xs text-gray-600">No journey logs or files found for this monitor yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Header bar ────────────────────────────────────── */}
            <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <FolderOpen size={14} className="text-violet-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Journey Files
                </span>
                {folderName && (
                    <span className="ml-auto text-[10px] text-gray-400 font-mono truncate max-w-[200px]" title={folderName}>
                        {folderName}
                    </span>
                )}
            </div>

            {/* ── File-switcher bar with per-file download ──────── */}
            <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-gray-100 bg-white scrollbar-thin">
                {files.map((file) => {
                    const active = selectedFile?.name === file.name;
                    return (
                        <div key={file.name} className="flex items-center gap-0.5 shrink-0">
                            <button
                                onClick={() => setSelectedFile(file)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-[11px] font-semibold whitespace-nowrap transition-all
                                    ${active
                                        ? 'bg-violet-100 text-violet-700 border border-r-0 border-violet-300'
                                        : 'bg-gray-100 text-gray-500 border border-r-0 border-gray-200 hover:bg-gray-200 hover:text-gray-700'
                                    }`}
                            >
                                <FileText size={12} />
                                {file.name}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                title={`Download ${file.name}`}
                                className={`px-1.5 py-1.5 rounded-r-lg text-[11px] transition-all
                                    ${active
                                        ? 'bg-violet-100 border border-l-0 border-violet-300 text-violet-500 hover:text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-gray-100 border border-l-0 border-gray-200 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100'
                                    }`}
                            >
                                <Download size={11} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── File content viewer ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 incident-log-content">
                {contentLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Loader2 size={14} className="animate-spin" />
                        Loading file…
                    </div>
                ) : isMarkdown(selectedFile?.name) ? (
                    <div className="prose prose-sm max-w-none
                        prose-headings:text-gray-800 prose-headings:font-black
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
                        prose-code:text-emerald-700 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-xl
                        prose-strong:text-gray-800
                        prose-li:text-gray-600
                        prose-blockquote:border-violet-400 prose-blockquote:text-gray-500
                        prose-table:text-gray-600
                        prose-th:text-gray-700 prose-th:border-gray-200
                        prose-td:border-gray-200
                        prose-hr:border-gray-200
                        prose-img:rounded-xl"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {fileContent}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {fileContent}
                    </pre>
                )}
            </div>
        </div>
    );
}

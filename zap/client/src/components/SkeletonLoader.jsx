export function SkeletonCard() {
    return (
        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <div className="skeleton h-52 w-full" />
            <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-5 w-1/2 rounded mt-2" />
                <div className="skeleton h-9 w-full rounded-lg mt-3" />
            </div>
        </div>
    );
}

export function SkeletonText({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    );
}

export function SkeletonBlock({ className = '' }) {
    return <div className={`skeleton rounded ${className}`} />;
}

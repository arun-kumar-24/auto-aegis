'use client';

import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30 glow-purple-sm active:scale-95',
    ghost: 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20',
    danger: 'bg-red-600/80 hover:bg-red-500/80 text-white shadow-lg shadow-red-900/20',
    outline: 'border-2 border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400 font-black',
};

export default function Button({
    children,
    variant = 'primary',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false,
    size = 'md',
    ...rest
}) {
    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base'
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-2xl
                transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-4 focus:ring-violet-500/20
                ${sizes[size] || sizes.md}
                ${variants[variant] || variants.primary}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...rest}
        >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </button>
    );
}

'use client';

import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 active:scale-95',
    ghost: 'bg-transparent hover:bg-gray-50 text-gray-500 border border-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100',
    outline: 'border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-black',
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
                focus:outline-none focus:ring-4 focus:ring-violet-500/10
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

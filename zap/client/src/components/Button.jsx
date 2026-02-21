import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300 border border-zinc-700',
    danger: 'bg-red-600/90 hover:bg-red-500 text-white',
    outline: 'border border-violet-500 text-violet-400 hover:bg-violet-500/10',
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
    const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' };
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900
        ${sizes[size] || sizes.md}
        ${variants[variant] || variants.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...rest}
        >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {children}
        </button>
    );
}

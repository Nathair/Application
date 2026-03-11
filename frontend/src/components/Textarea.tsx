import { type TextareaHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    icon,
    className = '',
    containerClassName = '',
    id,
    ...props
}, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={inputId} className="flex items-center text-sm font-semibold text-gray-700">
                    {icon && <span className="mr-2 text-gray-400">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="relative">
                <textarea
                    id={inputId}
                    ref={ref}
                    className={`input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors w-full min-h-[100px] resize-y ${error ? 'border-red-500 focus:ring-red-200 bg-red-50' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
});

Textarea.displayName = 'Textarea';

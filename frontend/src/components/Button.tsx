import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-2 text-center";

    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
        secondary: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
        outline: "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600 shadow-none"
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base"
    };

    const loadingStyles = isLoading ? "relative !text-transparent" : "";

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            {icon && !isLoading && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
}

import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
    isOpen: boolean;
    type: 'confirm' | 'info' | 'error';
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onClose: () => void;
}

export function Modal({ isOpen, type, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onClose }: ModalProps) {
    if (!isOpen) return null;

    const isError = type === 'error' || type === 'confirm';
    const accentState = isError
        ? { shadow: 'bg-red-50 border-red-100', text: 'text-red-500', btn: 'bg-red-600 hover:bg-red-700' }
        : { shadow: 'bg-blue-50 border-blue-100', text: 'text-blue-500', btn: 'bg-blue-600 hover:bg-blue-700' };

    const Icon = type === 'error' ? AlertCircle : CheckCircle;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className={`w-12 h-12 rounded-full ${accentState.shadow} flex items-center justify-center mb-4 mx-auto border`}>
                    <Icon size={24} className={accentState.text} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {onConfirm ? cancelLabel : 'Close'}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant={isError ? 'danger' : 'primary'}
                            onClick={() => { onConfirm(); onClose(); }}
                            className="flex-1"
                        >
                            {confirmLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

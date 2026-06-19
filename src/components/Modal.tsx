import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-wood-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-float animate-slide-up overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-wood-100">
          <h3 className="text-lg font-serif font-semibold text-wood-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

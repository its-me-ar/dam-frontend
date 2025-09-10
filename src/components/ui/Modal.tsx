import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  contentClassName?: string;
};

const sizeToWidth: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
  contentClassName = '',
}: ModalProps) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${sizeToWidth[size]} mx-4 rounded-2xl bg-white shadow-2xl`}
      >
        {title ? (
          <div className='flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-3'>
            <h3 className='text-base font-semibold text-gray-800'>{title}</h3>
            <button
              onClick={onClose}
              className='rounded-full p-1 text-gray-500 hover:bg-gray-100'
              aria-label='Close'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        ) : null}
        <div
          className={`max-h-[85vh] overflow-auto px-5 py-3 ${contentClassName}`}
        >
          {children}
        </div>
        {footer ? (
          <div className='border-t border-gray-100 px-5 py-3'>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

import { AlertCircle, Lock, FileX } from 'lucide-react';

interface SharedAssetErrorProps {
  error: Error;
}

export function SharedAssetError({ error }: SharedAssetErrorProps) {
  // Check if it's a 401 authentication error
  const isAuthError =
    error.message?.includes('Authorization token missing') ||
    error.message?.includes('401') ||
    (error as any)?.response?.status === 401;

  const isPrivateError =
    error.message === 'Asset is private and not accessible';

  const getErrorConfig = () => {
    if (isAuthError) {
      return {
        icon: Lock,
        title: 'Login Required',
        message: 'Please login to view assets.',
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    }

    if (isPrivateError) {
      return {
        icon: AlertCircle,
        title: 'Access Denied',
        message: 'This asset is private and not accessible through sharing.',
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    }

    return {
      icon: FileX,
      title: 'Asset Not Found',
      message: 'The shared asset could not be found or is no longer available.',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    };
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div
        className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-xl p-8 text-center`}
      >
        <div className={`${config.iconColor} mb-4`}>
          <Icon className='h-16 w-16 mx-auto' />
        </div>
        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
          {config.title}
        </h1>
        <p className='text-gray-600 mb-6'>{config.message}</p>
        {isAuthError ? (
          <button
            onClick={() => (window.location.href = '/login')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            Go to Login
          </button>
        ) : null}
      </div>
    </div>
  );
}

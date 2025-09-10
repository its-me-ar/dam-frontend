import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shareAsset, type ShareAssetPayload } from '../lib/api';

export function useShareAsset() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: ShareAssetPayload) => shareAsset(payload),
    onSuccess: () => {
      // Invalidate assets query to refresh the content
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      // The error will be handled in the component
      console.error('Share asset error:', error);
    },
  });

  return {
    share: mutation.mutate,
    shareAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

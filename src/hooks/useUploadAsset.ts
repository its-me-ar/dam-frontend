import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

type PresignResponse = {
  status: string;
  message: string;
  data: { url: string; asset_id: string };
};

async function presignUpload(input: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const { data } = await apiClient.post<PresignResponse>(
    '/assets/uploads/presign',
    {
      filename: input.filename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
    }
  );
  return data.data;
}

async function putBinary(url: string, file: File) {
  const res = await fetch(url, { method: 'PUT', body: file });
  if (!res.ok) throw new Error('Upload failed');
}

async function completeUpload(assetId: string) {
  await apiClient.post('/assets/uploads/complete', { asset_id: assetId });
}

export function useUploadAsset() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['upload-asset'],
    mutationFn: async (file: File) => {
      const presigned = await presignUpload({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      await putBinary(presigned.url, file);
      await completeUpload(presigned.asset_id);
      return presigned.asset_id;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

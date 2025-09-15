export type Toast = {
  id: number;
  message: string;
  variant: 'default' | 'success' | 'error';
};

export type ToastCtx = {
  notify: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
};

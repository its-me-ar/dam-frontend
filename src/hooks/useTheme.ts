// Light-only placeholder to avoid breaking imports; can be removed if unused.
export function useTheme() {
  return { theme: 'light' as const, setTheme: (_t: 'light') => {} }
}



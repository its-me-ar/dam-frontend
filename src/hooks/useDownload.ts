import { useCallback } from 'react'

export function useDownload() {
  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback to direct link
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      link.click()
    }
  }, [])

  return { downloadFile }
}

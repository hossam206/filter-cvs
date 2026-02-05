import { CVData } from '@/types/cv';

export function downloadOriginalCV(cv: CVData): void {
  if (!cv.originalFile) {
    console.error('No original file data available for this CV');
    alert('Original file is not available for download');
    return;
  }

  try {
    // Convert base64 to blob
    const byteCharacters = atob(cv.originalFile);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: cv.fileType || 'application/pdf' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cv.fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CV:', error);
    alert('Failed to download CV. Please try again.');
  }
}

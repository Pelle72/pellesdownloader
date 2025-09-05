export interface LocalDownload {
  id: string;
  title: string;
  url: string;
  download_url: string;
  format: string;
  quality?: string;
  file_size?: number;
  duration?: string;
  platform: string;
  downloaded_at: string;
}

const STORAGE_KEY = 'download_history';

export const getDownloadHistory = (): LocalDownload[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading download history:', error);
    return [];
  }
};

export const addToDownloadHistory = (download: Omit<LocalDownload, 'id' | 'downloaded_at'>): void => {
  try {
    const history = getDownloadHistory();
    const newDownload: LocalDownload = {
      ...download,
      id: generateId(),
      downloaded_at: new Date().toISOString(),
    };
    
    // Add to beginning of array (most recent first)
    history.unshift(newDownload);
    
    // Keep only last 100 downloads to prevent storage bloat
    const trimmedHistory = history.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to download history:', error);
  }
};

export const removeFromDownloadHistory = (id: string): void => {
  try {
    const history = getDownloadHistory();
    const filtered = history.filter(download => download.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from download history:', error);
  }
};

export const clearDownloadHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing download history:', error);
  }
};

// Simple ID generator
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'aurora-nexus-files';

export interface AuroraFile {
  id: string;
  owner: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadDate: string;
  downloadCount: number;
  isPublic: boolean;
}

interface FileStats {
  totalFiles: number;
  totalOriginal: number;
  totalDeduplicated: number;
  totalSavings: number;
  savingsPercent: number;
}

interface FileSearchParams {
  owner?: string;
  query?: string;
  mimeType?: string;
  sizeMin?: number;
  sizeMax?: number;
  dateMin?: string;
  dateMax?: string;
}

interface FileContextValue {
  files: AuroraFile[];
  publicFiles: AuroraFile[];
  stats: FileStats;
  uploadFiles: (owner: string, fileList: FileList | File[] | null | undefined) => AuroraFile[];
  deleteFile: (id: string) => void;
  toggleShare: (id: string) => void;
  incrementDownload: (id: string) => void;
  searchFiles: (params: FileSearchParams) => AuroraFile[];
}

const readStoredFiles = (): AuroraFile[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is AuroraFile => typeof entry === 'object' && entry !== null && 'id' in entry);
    }
    return [];
  } catch (error) {
    console.warn('Unable to read stored files', error);
    return [];
  }
};

const persistFiles = (files: AuroraFile[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (error) {
    console.warn('Unable to persist files', error);
  }
};

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const FileContext = createContext<FileContextValue | undefined>(undefined);

interface FileProviderProps {
  children: ReactNode;
}

const normaliseFileList = (fileList: FileList | File[] | null | undefined): File[] => {
  if (!fileList) return [];
  if (Array.isArray(fileList)) return fileList;
  return Array.from(fileList);
};

export const FileProvider = ({ children }: FileProviderProps) => {
  const [files, setFiles] = useState<AuroraFile[]>(readStoredFiles);

  const updateFiles = useCallback(
    (updater: AuroraFile[] | ((prev: AuroraFile[]) => AuroraFile[])) => {
      setFiles((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistFiles(next);
        return next;
      });
    },
    []
  );

  const uploadFiles = useCallback(
    (owner: string, fileList: FileList | File[] | null | undefined): AuroraFile[] => {
      const normalised = normaliseFileList(fileList);
      if (!owner || normalised.length === 0) {
        return [];
      }
      const additions: AuroraFile[] = normalised.map((file) => ({
        id: createId(),
        owner,
        filename: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        isPublic: false,
      }));
      updateFiles((prev) => [...prev, ...additions]);
      return additions;
    },
    [updateFiles]
  );

  const deleteFile = useCallback(
    (id: string) => {
      updateFiles((prev) => prev.filter((file) => file.id !== id));
    },
    [updateFiles]
  );

  const toggleShare = useCallback(
    (id: string) => {
      updateFiles((prev) => prev.map((file) => (file.id === id ? { ...file, isPublic: !file.isPublic } : file)));
    },
    [updateFiles]
  );

  const incrementDownload = useCallback(
    (id: string) => {
      updateFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, downloadCount: (file.downloadCount ?? 0) + 1 } : file
        )
      );
    },
    [updateFiles]
  );

  const stats = useMemo<FileStats>(() => {
    const totalOriginal = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
    const uniqueMap = new Map<string, number>();
    files.forEach((file) => {
      const key = `${file.filename}-${file.size}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, file.size ?? 0);
      }
    });
    const totalDeduplicated = Array.from(uniqueMap.values()).reduce((sum, value) => sum + value, 0);
    const totalSavings = totalOriginal - totalDeduplicated;
    const savingsPercent = totalOriginal ? Math.round((totalSavings / totalOriginal) * 100) : 0;
    return {
      totalFiles: files.length,
      totalOriginal,
      totalDeduplicated,
      totalSavings,
      savingsPercent,
    };
  }, [files]);

  const searchFiles = useCallback(
    ({ owner, query, mimeType, sizeMin, sizeMax, dateMin, dateMax }: FileSearchParams): AuroraFile[] => {
      const normalisedQuery = query?.toLowerCase().trim();
      return files.filter((file) => {
        if (owner && file.owner !== owner) return false;
        if (normalisedQuery && !file.filename.toLowerCase().includes(normalisedQuery)) return false;
        if (mimeType && mimeType !== 'all' && file.mimeType !== mimeType) return false;
        if (typeof sizeMin === 'number' && file.size < sizeMin) return false;
        if (typeof sizeMax === 'number' && file.size > sizeMax) return false;
        const uploadedTime = new Date(file.uploadDate).getTime();
        if (dateMin) {
          const minTime = new Date(dateMin).setHours(0, 0, 0, 0);
          if (uploadedTime < minTime) return false;
        }
        if (dateMax) {
          const maxTime = new Date(dateMax).setHours(23, 59, 59, 999);
          if (uploadedTime > maxTime) return false;
        }
        return true;
      });
    },
    [files]
  );

  const value = useMemo<FileContextValue>(
    () => ({
      files,
      publicFiles: files.filter((file) => file.isPublic),
      stats,
      uploadFiles,
      deleteFile,
      toggleShare,
      incrementDownload,
      searchFiles,
    }),
    [files, stats, uploadFiles, deleteFile, toggleShare, incrementDownload, searchFiles]
  );

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFileContext = (): FileContextValue => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

export type { FileContextValue, FileSearchParams, FileStats };

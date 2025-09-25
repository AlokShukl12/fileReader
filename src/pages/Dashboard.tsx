import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useFiles, type AuroraFile } from '../hooks/useFiles';

interface DashboardFilters {
  query: string;
  mime: string;
  sizeMin: string;
  sizeMax: string;
  dateMin: string;
  dateMax: string;
}

type UploadProgressMap = Record<string, number>;
type FeedbackMessage = string | null;

interface UserStats {
  totalOriginal: number;
  totalDeduplicated: number;
  totalSavings: number;
  savingsPercent: number;
  totalFiles: number;
}
const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
};

const formatDate = (isoString: string): string => new Date(isoString).toLocaleDateString();

const Dashboard = () => {
  const { user } = useAuth();
  const { uploadFiles, toggleShare, deleteFile, incrementDownload, searchFiles } = useFiles();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressMap>({});
  const [filters, setFilters] = useState<DashboardFilters>({ query: '', mime: 'all', sizeMin: '', sizeMax: '', dateMin: '', dateMax: '' });

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }
    const timer = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragging(true);
    } else if (event.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const simulateUploadProgress = (ids: string[]) => {
    ids.forEach((id) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(100, progress + 20 + Math.random() * 25);
        setUploadProgress((prev) => ({ ...prev, [id]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }, 400);
        }
      }, 160);
    });
  };

  const handleUpload = (fileList: FileList | File[] | null | undefined) => {
    if (!user || !fileList?.length) {
      return;
    }
    const created = uploadFiles(user.username, fileList);
    if (created.length) {
      setFeedback(`${created.length} file${created.length > 1 ? 's' : ''} added to your library.`);
      simulateUploadProgress(created.map((entry) => entry.id));
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleUpload(event.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleUpload(event.target.files);
    event.target.value = '';
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const numericOrUndefined = (value: string) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const filteredFiles = useMemo<AuroraFile[]>(() => {
    if (!user) return [];
    return searchFiles({
      owner: user.username,
      query: filters.query,
      mimeType: filters.mime !== 'all' ? filters.mime : undefined,
      sizeMin: numericOrUndefined(filters.sizeMin),
      sizeMax: numericOrUndefined(filters.sizeMax),
      dateMin: filters.dateMin || undefined,
      dateMax: filters.dateMax || undefined,
    });
  }, [filters, searchFiles, user]);

  const mimeOptions = useMemo<string[]>(() => {
    const unique = new Set(filteredFiles.map((file) => file.mimeType));
    return Array.from(unique.values());
  }, [filteredFiles]);

  const userStats = useMemo<UserStats>(() => {
    const totalOriginal = filteredFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    const uniqueMap = new Map();
    filteredFiles.forEach((file) => {
      const key = `${file.filename}-${file.size}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, file.size || 0);
      }
    });
    const totalDeduplicated = Array.from(uniqueMap.values()).reduce((sum, value) => sum + value, 0);
    const totalSavings = totalOriginal - totalDeduplicated;
    const savingsPercent = totalOriginal ? Math.round((totalSavings / totalOriginal) * 100) : 0;
    return { totalOriginal, totalDeduplicated, totalSavings, savingsPercent, totalFiles: filteredFiles.length };
  }, [filteredFiles]);

  const handleDownload = (id: string, filename: string) => {
    incrementDownload(id);
    setFeedback(`Download started for ${filename}.`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this file from your library?')) {
      deleteFile(id);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.section
      className="dashboard-grid"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <div
        className={`glass-panel upload-zone${isDragging ? ' upload-zone--active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{ padding: '2.2rem', display: 'grid', gap: '1.4rem' }}
      >
        <div>
          <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
            File management
          </h2>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            Drag and drop files here or browse to upload. Aurora deduplicates files automatically to save space.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={handleBrowseClick}>Browse files</Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
          <span style={{ color: 'rgba(203, 213, 225, 0.75)', fontSize: '0.9rem' }}>
            Supported: any file type. Upload size tracked in bytes.
          </span>
        </div>
        {Object.keys(uploadProgress).length > 0 && (
          <div className="section-stack" style={{ gap: '0.8rem' }}>
            {(Object.entries(uploadProgress) as Array<[string, number]>).map(([id, value]) => (
              <div key={id} style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ color: 'rgba(203, 213, 225, 0.8)', fontSize: '0.85rem' }}>Uploading...</span>
                <div style={{ height: '8px', background: 'rgba(30,41,72,0.75)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${value}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                      transition: 'width 160ms ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {feedback && (
          <div className="contact-feedback" style={{ marginTop: '0.2rem' }}>
            {feedback}
          </div>
        )}
      </div>

      <div className="dashboard-grid__split">
        <div className="metric-card">
          <h4>Total storage usage</h4>
          <strong>{formatBytes(userStats.totalOriginal)}</strong>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            Original size of files you have uploaded.
          </p>
        </div>
        <div className="metric-card">
          <h4>Deduplicated storage</h4>
          <strong>{formatBytes(userStats.totalDeduplicated)}</strong>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            Storage after removing duplicate content.
          </p>
        </div>
        <div className="metric-card">
          <h4>Storage savings</h4>
          <strong>{formatBytes(userStats.totalSavings)}</strong>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            {userStats.savingsPercent}% saved compared to original uploads.
          </p>
        </div>
      </div>

      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.08 } }}
        style={{ padding: '2rem', display: 'grid', gap: '1.2rem' }}
      >
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>Search & filter</h3>
          <div className="section-stack" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', display: 'grid', gap: '1rem' }}>
            <label className="input-label">
              search filename
              <input name="query" value={filters.query} onChange={handleFilterChange} placeholder="e.g. invoice" />
            </label>
            <label className="input-label">
              mime type
              <select name="mime" value={filters.mime} onChange={handleFilterChange} style={{
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                padding: '0.75rem 0.85rem',
              }}>
                <option value="all">All types</option>
                {mimeOptions.map((mime) => (
                  <option key={mime || 'unknown'} value={mime || 'unknown'}>
                    {mime || 'unknown'}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-label">
              size min (bytes)
              <input name="sizeMin" value={filters.sizeMin} onChange={handleFilterChange} type="number" min="0" />
            </label>
            <label className="input-label">
              size max (bytes)
              <input name="sizeMax" value={filters.sizeMax} onChange={handleFilterChange} type="number" min="0" />
            </label>
            <label className="input-label">
              date from
              <input name="dateMin" value={filters.dateMin} onChange={handleFilterChange} type="date" />
            </label>
            <label className="input-label">
              date to
              <input name="dateMax" value={filters.dateMax} onChange={handleFilterChange} type="date" />
            </label>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead style={{ textAlign: 'left', color: 'rgba(203, 213, 225, 0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <tr>
                <th style={{ padding: '0 16px' }}>Filename</th>
                <th style={{ padding: '0 16px' }}>Size</th>
                <th style={{ padding: '0 16px' }}>MIME Type</th>
                <th style={{ padding: '0 16px' }}>Upload Date</th>
                <th style={{ padding: '0 16px' }}>Downloads</th>
                <th style={{ padding: '0 16px' }}>Status</th>
                <th style={{ padding: '0 16px', width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '12px 0 0 12px' }}>
                    {file.filename}
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{formatBytes(file.size)}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.mimeType || 'unknown'}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{formatDate(file.uploadDate)}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.downloadCount || 0}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>
                    <span
                      className="stat-badge"
                      style={{
                        background: file.isPublic ? 'rgba(34, 197, 94, 0.18)' : 'rgba(148, 163, 184, 0.12)',
                        borderColor: file.isPublic ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.2)',
                        color: file.isPublic ? 'rgba(187, 247, 208, 0.9)' : 'rgba(203, 213, 225, 0.85)',
                      }}
                    >
                      {file.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '0 12px 12px 0' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button variant="ghost" onClick={() => handleDownload(file.id, file.filename)} style={{ padding: '0.45rem 0.9rem' }}>
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => toggleShare(file.id)}
                        style={{ padding: '0.45rem 0.9rem' }}
                      >
                        {file.isPublic ? 'Make private' : 'Share public'}
                      </Button>
                      <Button
                        variant="ghost"
                        className="btn--danger"
                        onClick={() => handleDelete(file.id)}
                        style={{ padding: '0.45rem 0.9rem' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: 'rgba(148, 163, 184, 0.8)' }}>
                    No files match the current filters. Upload a file or adjust the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Dashboard;


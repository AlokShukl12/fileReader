import { useMemo, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { useAuth, type SessionUser, type UserRole } from '../hooks/useAuth';
import { useFiles, type AuroraFile } from '../hooks/useFiles';

const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  const fractionDigits = value < 10 && index > 0 ? 1 : 0;
  return `${value.toFixed(fractionDigits)} ${units[index]}`;
};

const formatDate = (isoString: string): string => new Date(isoString).toLocaleDateString();

interface Totals {
  userCount: number;
  fileCount: number;
  downloads: number;
  original: number;
  deduplicated: number;
  savings: number;
  savingsPercent: number;
}

const AdminPanel = () => {
  const { user, users, updateUserRole, removeUser } = useAuth();
  const { files, publicFiles, stats } = useFiles();

  if (!user || user.role !== 'admin') {
    return (
      <motion.section
        className="dashboard-grid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>Admin only</h2>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            You need administrator privileges to view the system control room.
          </p>
        </div>
      </motion.section>
    );
  }

  const totals = useMemo<Totals>(() => {
    const downloads = files.reduce((sum, file) => sum + (file.downloadCount ?? 0), 0);
    const original = stats.totalOriginal;
    const deduplicated = stats.totalDeduplicated;
    const savings = stats.totalSavings;
    const savingsPercent = original ? Math.round((savings / original) * 100) : 0;
    return {
      userCount: users.length,
      fileCount: files.length,
      downloads,
      original,
      deduplicated,
      savings,
      savingsPercent,
    };
  }, [users, files, stats]);

  const handleRoleChange = (username: string, event: ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = event.target.value as UserRole;
    updateUserRole(username, selectedRole);
  };

  const handleRemove = (username: string) => {
    if (window.confirm('Remove this user from the workspace?')) {
      removeUser(username);
    }
  };

  const otherUsers = users.filter((entry) => entry.username !== user.username);

  return (
    <motion.section
      className="dashboard-grid"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gap: '1.2rem' }}>
        <span className="stat-badge" style={{ width: 'fit-content' }}>Admin control centre</span>
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
          System overview
        </h2>
        <p className="hero-subtitle" style={{ margin: 0 }}>
          Monitor usage, manage roles, and review every file stored in Aurora Nexus.
        </p>
        <div className="dashboard-grid__split">
          <div className="metric-card">
            <h4>Users</h4>
            <strong>{totals.userCount}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Active accounts in the workspace.</p>
          </div>
          <div className="metric-card">
            <h4>Files</h4>
            <strong>{totals.fileCount}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Total records across all users.</p>
          </div>
          <div className="metric-card">
            <h4>Original storage</h4>
            <strong>{formatBytes(totals.original)}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Sum of raw uploads without dedupe.</p>
          </div>
          <div className="metric-card">
            <h4>Deduplicated storage</h4>
            <strong>{formatBytes(totals.deduplicated)}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Space required after optimisation.</p>
          </div>
          <div className="metric-card">
            <h4>Storage savings</h4>
            <strong>{`${formatBytes(totals.savings)} (${totals.savingsPercent}%)`}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Bytes saved by deduplication.</p>
          </div>
          <div className="metric-card">
            <h4>Downloads tracked</h4>
            <strong>{totals.downloads}</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>Total download count across files.</p>
          </div>
        </div>
      </div>

      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.08 } }}
        style={{ padding: '2rem', display: 'grid', gap: '1.2rem' }}
      >
        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>Team directory</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead style={{ textAlign: 'left', color: 'rgba(203, 213, 225, 0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <tr>
                <th style={{ padding: '0 16px' }}>Username</th>
                <th style={{ padding: '0 16px' }}>Role</th>
                <th style={{ padding: '0 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {otherUsers.map((entry: SessionUser) => (
                <tr key={entry.username}>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '12px 0 0 12px' }}>
                    {entry.username}
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>
                    <select
                      value={entry.role}
                      onChange={(event) => handleRoleChange(entry.username, event)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        padding: '0.55rem 0.75rem',
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '0 12px 12px 0' }}>
                    <Button
                      variant="ghost"
                      className="btn--danger"
                      onClick={() => handleRemove(entry.username)}
                      style={{ padding: '0.45rem 0.9rem' }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.12 } }}
        style={{ padding: '2rem', display: 'grid', gap: '1.2rem' }}
      >
        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>All files</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead style={{ textAlign: 'left', color: 'rgba(203, 213, 225, 0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <tr>
                <th style={{ padding: '0 16px' }}>Filename</th>
                <th style={{ padding: '0 16px' }}>Uploader</th>
                <th style={{ padding: '0 16px' }}>Size</th>
                <th style={{ padding: '0 16px' }}>MIME</th>
                <th style={{ padding: '0 16px' }}>Upload Date</th>
                <th style={{ padding: '0 16px' }}>Downloads</th>
                <th style={{ padding: '0 16px' }}>Sharing</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file: AuroraFile) => (
                <tr key={file.id}>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '12px 0 0 12px' }}>
                    {file.filename}
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.owner}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{formatBytes(file.size)}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.mimeType || 'unknown'}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{formatDate(file.uploadDate)}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.downloadCount ?? 0}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '0 12px 12px 0' }}>
                    {file.isPublic ? 'Public' : 'Private'}
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: 'rgba(148, 163, 184, 0.8)' }}>
                    No files uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.16 } }}
        style={{ padding: '2rem', display: 'grid', gap: '1.2rem' }}
      >
        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>Public files</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead style={{ textAlign: 'left', color: 'rgba(203, 213, 225, 0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <tr>
                <th style={{ padding: '0 16px' }}>Filename</th>
                <th style={{ padding: '0 16px' }}>Uploader</th>
                <th style={{ padding: '0 16px' }}>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {publicFiles.map((file: AuroraFile) => (
                <tr key={file.id}>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '12px 0 0 12px' }}>
                    {file.filename}
                  </td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)' }}>{file.owner}</td>
                  <td style={{ padding: '14px 16px', background: 'rgba(19,30,53,0.7)', borderRadius: '0 12px 12px 0' }}>
                    {file.downloadCount ?? 0}
                  </td>
                </tr>
              ))}
              {publicFiles.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'rgba(148, 163, 184, 0.8)' }}>
                    No public files at the moment.
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

export default AdminPanel;


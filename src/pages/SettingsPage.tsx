import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { exportUserData, importUserData, resetAllBlocks } from '../services/firestore';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Spinner from '../components/Spinner';
import {
  ArrowLeft, Download, Upload, Trash2, LogOut,
  KeyRound, ChevronRight, AlertTriangle, CheckCircle2,
  Sun, Moon, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password update state
  const [showPassword, setShowPassword]       = useState(false);
  const [currentPass, setCurrentPass]         = useState('');
  const [newPass, setNewPass]                 = useState('');
  const [confirmPass, setConfirmPass]         = useState('');
  const [passLoading, setPassLoading]         = useState(false);

  // Reset state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading]         = useState(false);

  // Import state
  const [importLoading, setImportLoading] = useState(false);

  // Export
  async function handleExport() {
    if (!user) return;
    try {
      const data = await exportUserData(user.uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `21days-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Export failed');
    }
  }

  // Import
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImportLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importUserData(user.uid, data);
      toast.success('Data imported successfully 🔥');
    } catch {
      toast.error('Import failed — invalid file format');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Reset all
  async function handleReset() {
    if (!user) return;
    setResetLoading(true);
    try {
      await resetAllBlocks(user.uid);
      toast.success('All data reset');
      setShowResetConfirm(false);
    } catch {
      toast.error('Reset failed');
    } finally {
      setResetLoading(false);
    }
  }

  // Password update
  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return; }
    if (newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPassLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      toast.success('Password updated ✓');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      setShowPassword(false);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') toast.error('Current password is incorrect');
      else toast.error('Password update failed');
    } finally {
      setPassLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/');
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="settings-main">

        {/* Topbar */}
        <div className="settings-topbar">
          <button className="settings-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="settings-topbar-divider" />
          <span className="settings-topbar-title">Settings</span>
          <button className="settings-theme-btn" onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Profile card */}
        <div className="settings-profile-card">
          <div className="spc-avatar">{initials}</div>
          <div className="spc-info">
            <p className="spc-email">{user?.email}</p>
            <p className="spc-uid">UID: {user?.uid?.slice(0, 16)}…</p>
          </div>
          <div className="spc-status">
            <CheckCircle2 size={14} />
            <span>Authenticated</span>
          </div>
        </div>

        <div className="settings-body">

          {/* ── Data section ── */}
          <div className="settings-section">
            <p className="settings-section-label">Data Management</p>

            {/* Export */}
            <div className="settings-card">
              <div className="sc-icon sc-icon--green"><Download size={16} /></div>
              <div className="sc-content">
                <p className="sc-title">Export Data</p>
                <p className="sc-desc">Download all your blocks and logs as a JSON backup file</p>
              </div>
              <button className="sc-action btn-ghost" onClick={handleExport}>
                Export <ChevronRight size={13} />
              </button>
            </div>

            {/* Import */}
            <div className="settings-card">
              <div className="sc-icon sc-icon--accent"><Upload size={16} /></div>
              <div className="sc-content">
                <p className="sc-title">Import Data</p>
                <p className="sc-desc">Restore from a previously exported 21Days+ JSON backup</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
                id="import-file-input"
              />
              <button
                className="sc-action btn-ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
              >
                {importLoading ? <Spinner size={13} /> : <><Upload size={13} /> Import</>}
              </button>
            </div>
          </div>

          {/* ── Account section ── */}
          <div className="settings-section">
            <p className="settings-section-label">Account</p>

            {/* Theme toggle */}
            <div className="settings-card">
              <div className="sc-icon sc-icon--muted">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div className="sc-content">
                <p className="sc-title">Appearance</p>
                <p className="sc-desc">Currently using <strong>{theme} mode</strong></p>
              </div>
              <button className="sc-action btn-ghost" onClick={toggle}>
                {theme === 'dark' ? 'Light' : 'Dark'} <ChevronRight size={13} />
              </button>
            </div>

            {/* Password update */}
            <div className="settings-card settings-card--expandable">
              <div className="sc-icon sc-icon--yellow"><KeyRound size={16} /></div>
              <div className="sc-content">
                <p className="sc-title">Update Password</p>
                <p className="sc-desc">Change your account password</p>
              </div>
              <button
                className="sc-action btn-ghost"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? 'Cancel' : 'Update'}
                <ChevronRight size={13} style={{ transform: showPassword ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }} />
              </button>
            </div>
            {showPassword && (
              <form className="settings-expand-form fade-in" onSubmit={handlePasswordUpdate}>
                <div className="sef-field">
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    className="input"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="sef-field">
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    className="input"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                <div className="sef-field">
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
                <div className="sef-actions">
                  <button type="submit" className="btn-primary" disabled={passLoading}>
                    {passLoading ? <Spinner size={13} /> : <><KeyRound size={13} /> Update Password</>}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setShowPassword(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Sign out */}
            <div className="settings-card">
              <div className="sc-icon sc-icon--muted"><LogOut size={16} /></div>
              <div className="sc-content">
                <p className="sc-title">Sign Out</p>
                <p className="sc-desc">Sign out of your account on this device</p>
              </div>
              <button className="sc-action btn-ghost" onClick={handleSignOut}>
                Sign Out <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div className="settings-section settings-section--danger">
            <p className="settings-section-label settings-section-label--danger">
              <AlertTriangle size={12} /> Danger Zone
            </p>

            <div className="settings-card settings-card--danger">
              <div className="sc-icon sc-icon--red"><Trash2 size={16} /></div>
              <div className="sc-content">
                <p className="sc-title">Reset All Data</p>
                <p className="sc-desc">Permanently delete all blocks and tracking history. This cannot be undone.</p>
              </div>
              {!showResetConfirm ? (
                <button
                  className="sc-action btn-danger"
                  onClick={() => setShowResetConfirm(true)}
                >
                  Reset <ChevronRight size={13} />
                </button>
              ) : (
                <div className="sc-confirm">
                  <p className="sc-confirm-text">Are you sure?</p>
                  <div className="sc-confirm-btns">
                    <button className="btn-danger" onClick={handleReset} disabled={resetLoading}>
                      {resetLoading ? <Spinner size={13} /> : 'Yes, Delete All'}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowResetConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="settings-footer">
            <div className="settings-footer-logo">
              <Flame size={14} color="var(--accent)" />
              <span>21Days+</span>
            </div>
            <p>Build discipline. One block at a time.</p>
            <p className="settings-version">v1.0.0 · Monolith</p>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

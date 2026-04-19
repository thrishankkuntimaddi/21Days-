import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Block, DayLog } from '../types';
import { subscribeBlocks, subscribeLogs, updateBlock, deleteBlock } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from '../components/BottomNav';
import TrackingGrid from '../components/TrackingGrid';
import Spinner from '../components/Spinner';
import CreateBlockModal from '../components/CreateBlockModal';
import StatsPanel from '../components/StatsPanel';
import HeatmapChart from '../components/HeatmapChart';
import {
  ArrowLeft, Lock, Flame, Calendar, CheckCircle2,
  Zap, TrendingUp, Copy, Trash2, ChevronDown, ChevronUp, BarChart2, Sun, Moon, LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  computeBlockStats, isBlockCompleted, isBlockFuture,
  formatDate, getBlockDates
} from '../utils';
import toast from 'react-hot-toast';
import './BlockPage.css';

export default function BlockPage() {
  const { blockId } = useParams<{ blockId: string }>();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [blocks, setBlocks]               = useState<Block[]>([]);
  const [logs, setLogs]                   = useState<DayLog[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showStats, setShowStats]         = useState(false);
  const [showHeatmap, setShowHeatmap]     = useState(false);
  const [showExtend, setShowExtend]       = useState(false);
  const [extendDays, setExtendDays]       = useState(21);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const block = blocks.find(b => b.id === blockId);

  useEffect(() => {
    if (!user) return;
    return subscribeBlocks(user.uid, (b) => { setBlocks(b); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (!user || !blockId) return;
    return subscribeLogs(user.uid, blockId, setLogs);
  }, [user, blockId]);

  async function handleLogout() {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/');
  }

  // ── Loading / not-found states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!block) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Block not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const stats       = computeBlockStats(block, logs);
  const completed   = isBlockCompleted(block);
  const future      = isBlockFuture(block);
  const endDate     = getBlockDates(block).at(-1) ?? '';
  const doTasks     = block.tasks.filter(t => t.type === 'do');
  const dontTasks   = block.tasks.filter(t => t.type === 'dont');
  const statusLabel = future ? 'Upcoming' : completed ? 'Completed' : 'Active';
  const statusClass = future ? 'status-future' : completed ? 'status-done' : 'status-active';
  const progressColor = stats.overallPercent >= 80 ? 'var(--green)'
    : stats.overallPercent >= 50 ? 'var(--yellow)' : 'var(--red)';
  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleExtend() {
    if (!user || !blockId) return;
    setActionLoading(true);
    try {
      await updateBlock(user.uid, blockId, {
        duration: block!.duration + extendDays,
        completed: false,
        locked: true,
      });
      toast.success(`Extended by ${extendDays} days 🔥`);
      setShowExtend(false);
    } catch { toast.error('Failed to extend block'); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!user || !blockId) return;
    setActionLoading(true);
    try {
      await deleteBlock(user.uid, blockId);
      toast.success('Block deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete block');
      setActionLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Flame size={15} color="var(--accent)" /></div>
          <span className="logo-text">21Days<span>+</span></span>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Dashboard
          </button>
        </nav>
        <button className="sidebar-theme-toggle" onClick={toggle}>
          {theme === 'dark' ? <><Sun size={13} /> Light Mode</> : <><Moon size={13} /> Dark Mode</>}
        </button>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info"><p className="user-email">{user?.email}</p></div>
          </div>
          <button className="sidebar-signout" onClick={handleLogout} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', paddingBottom: 72 }}>

        {/* Topbar */}
        <div className="bp-topbar">
          <button className="bp-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="bp-topbar-divider" />
          <span className="bp-topbar-title">{block.title}</span>
          <span className={`bc-status ${statusClass}`}>{statusLabel}</span>
          {block.locked && !completed && (
            <span className="bp-lock-badge"><Lock size={10} /> Locked</span>
          )}
        </div>

        {/* Hero */}
        <div className="bp-hero fade-in">
          <div className="bp-hero-left">
            <h1 className="bp-title">{block.title}</h1>
            <div className="bp-dates">
              <Calendar size={12} />
              <span>{formatDate(block.startDate)} → {formatDate(endDate)}</span>
              <span className="bp-dur-badge">{block.duration} days</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bp-quick-stats">
            <div className="bp-qs-item">
              <Flame size={13} style={{ color: 'var(--yellow)' }} />
              <span className="bp-qs-val">{stats.currentStreak}</span>
              <span className="bp-qs-label">Streak</span>
            </div>
            <div className="bp-qs-item">
              <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
              <span className="bp-qs-val">{stats.completedDays}</span>
              <span className="bp-qs-label">Perfect</span>
            </div>
            <div className="bp-qs-item">
              <TrendingUp size={13} style={{ color: progressColor }} />
              <span className="bp-qs-val" style={{ color: progressColor }}>{stats.overallPercent}%</span>
              <span className="bp-qs-label">Success</span>
            </div>
            <div className="bp-qs-item">
              <Zap size={13} style={{ color: 'var(--accent)' }} />
              <span className="bp-qs-val">{stats.longestStreak}</span>
              <span className="bp-qs-label">Best</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bp-progress-wrap">
          <div className="bp-progress-labels">
            <span>Overall Progress</span>
            <span style={{ color: progressColor }}>{stats.overallPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{
              width: `${stats.overallPercent}%`,
              background: progressColor,
            }} />
          </div>
        </div>

        {/* Section toggles */}
        <div className="bp-toggles fade-in">
          <button className={`bp-toggle-btn ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(v => !v)}>
            <BarChart2 size={13} /> Stats
            {showStats ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button className={`bp-toggle-btn ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(v => !v)}>
            Heatmap
            {showHeatmap ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {showStats && (
          <div className="bp-section fade-in">
            <StatsPanel block={block} logs={logs} stats={stats} />
          </div>
        )}
        {showHeatmap && (
          <div className="bp-section fade-in">
            <HeatmapChart block={block} logs={logs} />
          </div>
        )}

        {/* Tasks summary */}
        <div className="bp-tasks-row fade-in">
          <div className="bp-tasks-col">
            <p className="bp-tasks-heading">
              <span className="tag-do">✅ DO</span> {doTasks.length} habits
            </p>
            <ul className="bp-task-list">
              {doTasks.map(t => <li key={t.id} className="bp-task-item do">{t.text}</li>)}
            </ul>
          </div>
          <div className="bp-tasks-col">
            <p className="bp-tasks-heading">
              <span className="tag-dont">🚫 DON'T</span> {dontTasks.length} habits
            </p>
            <ul className="bp-task-list">
              {dontTasks.map(t => <li key={t.id} className="bp-task-item dont">{t.text}</li>)}
            </ul>
          </div>
        </div>

        {/* Tracking Grid */}
        <div className="bp-section fade-in" style={{ marginTop: 8 }}>
          <h2 className="bp-section-title">Task Tracking Grid</h2>
          <TrackingGrid block={block} logs={logs} />
        </div>

        {/* Completion banner */}
        {completed && (
          <div className="bp-completion-banner fade-in">
            <div className="bp-completion-header">
              <span className="bp-completion-badge">🏆 Block Complete!</span>
              <p>You've finished this block. Choose your next move:</p>
            </div>
            <div className="bp-completion-actions">
              {/* Extend */}
              <div className="bp-action-card">
                <div className="bp-action-icon" style={{ color: 'var(--accent)' }}>🔥</div>
                <h4>Extend</h4>
                <p>Add more days to keep the momentum going</p>
                {showExtend ? (
                  <div className="bp-extend-form">
                    <input type="number" className="input" value={extendDays}
                      onChange={e => setExtendDays(Number(e.target.value))}
                      min={1} max={365} style={{ width: 80 }} />
                    <span>days</span>
                    <button className="btn-primary" onClick={handleExtend} disabled={actionLoading}>
                      {actionLoading ? <Spinner size={13} /> : 'Confirm'}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowExtend(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => setShowExtend(true)}>
                    <Zap size={13} /> Extend Block
                  </button>
                )}
              </div>

              {/* Duplicate */}
              <div className="bp-action-card">
                <div className="bp-action-icon" style={{ color: 'var(--green)' }}>♻️</div>
                <h4>Duplicate</h4>
                <p>Start the same block again from today</p>
                {showDuplicate && (
                  <CreateBlockModal
                    onClose={() => setShowDuplicate(false)}
                    prefill={{ title: block.title + ' (Copy)', duration: block.duration, tasks: block.tasks }}
                  />
                )}
                <button className="btn-ghost" style={{ marginTop: 'auto' }} onClick={() => setShowDuplicate(true)}>
                  <Copy size={13} /> Duplicate Block
                </button>
              </div>

              {/* Delete */}
              <div className="bp-action-card">
                <div className="bp-action-icon" style={{ color: 'var(--red)' }}>🗑️</div>
                <h4>Remove</h4>
                <p>Permanently delete this completed block</p>
                {showDeleteConfirm ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button className="btn-danger" onClick={handleDelete} disabled={actionLoading}>
                      {actionLoading ? <Spinner size={13} /> : 'Confirm Delete'}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-danger" style={{ marginTop: 'auto' }} onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={13} /> Delete Block
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Danger zone — active blocks */}
        {!completed && (
          <div className="bp-danger-zone fade-in">
            <h3 className="bp-danger-title"><Trash2 size={13} /> Danger Zone</h3>
            <p>This block is currently <strong>locked</strong>. Deleting it permanently removes all tracking data.</p>
            {showDeleteConfirm ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-danger" onClick={handleDelete} disabled={actionLoading}>
                  {actionLoading ? <Spinner size={13} /> : 'Yes, Delete Forever'}
                </button>
                <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn-danger" style={{ marginTop: 12 }} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} /> Delete Block
              </button>
            )}
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <BottomNav onCreateBlock={() => navigate('/')} />

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Block, DayLog } from '../types';
import { subscribeBlocks, subscribeLogs, updateBlock, deleteBlock } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import TrackingGrid from '../components/TrackingGrid';
import Spinner from '../components/Spinner';
import CreateBlockModal from '../components/CreateBlockModal';
import StatsPanel from '../components/StatsPanel';
import HeatmapChart from '../components/HeatmapChart';
import {
  ArrowLeft, Lock, Unlock, Flame, Calendar, CheckCircle2,
  Zap, TrendingUp, Copy, Trash2, ChevronDown, ChevronUp, BarChart2
} from 'lucide-react';
import { computeBlockStats, isBlockCompleted, isBlockFuture, formatDate, getBlockDates } from '../utils';
import toast from 'react-hot-toast';
import './BlockPage.css';

export default function BlockPage() {
  const { blockId } = useParams<{ blockId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extendDays, setExtendDays] = useState(21);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const block = blocks.find(b => b.id === blockId);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeBlocks(user.uid, (b) => {
      setBlocks(b);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user || !blockId) return;
    const unsub = subscribeLogs(user.uid, blockId, setLogs);
    return unsub;
  }, [user, blockId]);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="bp-loading"><Spinner size={32} /></div>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="bp-loading">
          <p style={{ color: 'var(--text-muted)' }}>Block not found.</p>
          <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = computeBlockStats(block, logs);
  const completed = isBlockCompleted(block);
  const future = isBlockFuture(block);
  const endDate = getBlockDates(block).at(-1) ?? '';
  const doTasks = block.tasks.filter(t => t.type === 'do');
  const dontTasks = block.tasks.filter(t => t.type === 'dont');
  const statusLabel = future ? 'Upcoming' : completed ? 'Completed' : 'Active';
  const statusClass = future ? 'status-future' : completed ? 'status-done' : 'status-active';

  const progressColor = stats.overallPercent >= 80
    ? 'var(--green)' : stats.overallPercent >= 50
    ? 'var(--yellow)' : 'var(--red)';

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
    } catch {
      toast.error('Failed to extend block');
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="bp-main">
        {/* Back nav */}
        <button className="bp-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Dashboard
        </button>

        {/* Hero header */}
        <div className="bp-hero fade-in">
          <div className="bp-hero-left">
            <div className="bp-status-row">
              <span className={`bc-status ${statusClass}`}>{statusLabel}</span>
              {block.locked && !completed && (
                <span className="bp-lock-badge">
                  <Lock size={11} /> Locked
                </span>
              )}
              {completed && (
                <span className="bp-unlock-badge">
                  <Unlock size={11} /> Unlocked
                </span>
              )}
            </div>
            <h1 className="bp-title">{block.title}</h1>
            <div className="bp-dates">
              <Calendar size={13} />
              <span>{formatDate(block.startDate)} → {formatDate(endDate)}</span>
              <span className="bp-dur-badge">{block.duration} days</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bp-quick-stats">
            <div className="bp-qs-item">
              <Flame size={14} style={{ color: 'var(--yellow)' }} />
              <span className="bp-qs-val">{stats.currentStreak}</span>
              <span className="bp-qs-label">Streak</span>
            </div>
            <div className="bp-qs-divider" />
            <div className="bp-qs-item">
              <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
              <span className="bp-qs-val">{stats.completedDays}</span>
              <span className="bp-qs-label">Perfect days</span>
            </div>
            <div className="bp-qs-divider" />
            <div className="bp-qs-item">
              <TrendingUp size={14} style={{ color: progressColor }} />
              <span className="bp-qs-val" style={{ color: progressColor }}>{stats.overallPercent}%</span>
              <span className="bp-qs-label">Success</span>
            </div>
            <div className="bp-qs-divider" />
            <div className="bp-qs-item">
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span className="bp-qs-val">{stats.longestStreak}</span>
              <span className="bp-qs-label">Best streak</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bp-progress-wrap fade-in">
          <div className="bp-progress-labels">
            <span>Overall Progress</span>
            <span style={{ color: progressColor }}>{stats.overallPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.overallPercent}%`, background: progressColor, boxShadow: `0 0 12px ${progressColor}55` }}
            />
          </div>
        </div>

        {/* Section toggles */}
        <div className="bp-toggles fade-in">
          <button
            className={`bp-toggle-btn ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(v => !v)}
          >
            <BarChart2 size={14} />
            Stats
            {showStats ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            className={`bp-toggle-btn ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(v => !v)}
          >
            📊 Heatmap
            {showHeatmap ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="bp-section fade-in">
            <StatsPanel block={block} logs={logs} stats={stats} />
          </div>
        )}

        {/* Heatmap */}
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
              {doTasks.map(t => (
                <li key={t.id} className="bp-task-item do">{t.text}</li>
              ))}
            </ul>
          </div>
          <div className="bp-tasks-col">
            <p className="bp-tasks-heading">
              <span className="tag-dont">🚫 DON'T</span> {dontTasks.length} habits
            </p>
            <ul className="bp-task-list">
              {dontTasks.map(t => (
                <li key={t.id} className="bp-task-item dont">{t.text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* TRACKING GRID */}
        <div className="bp-section fade-in" style={{ marginTop: 24 }}>
          <h2 className="bp-section-title">Task Tracking Grid</h2>
          <TrackingGrid block={block} logs={logs} />
        </div>

        {/* Completion actions — only when completed */}
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
                    <input
                      type="number"
                      className="input"
                      value={extendDays}
                      onChange={e => setExtendDays(Number(e.target.value))}
                      min={1} max={365}
                      style={{ width: 100 }}
                    />
                    <span>days</span>
                    <button className="btn-primary" onClick={handleExtend} disabled={actionLoading}>
                      {actionLoading ? <Spinner size={14} /> : 'Confirm'}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowExtend(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => setShowExtend(true)}>
                    <Zap size={14} /> Extend Block
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
                    prefill={{
                      title: block.title + ' (Copy)',
                      duration: block.duration,
                      tasks: block.tasks,
                    }}
                  />
                )}
                <button className="btn-ghost" style={{ marginTop: 'auto' }} onClick={() => setShowDuplicate(true)}>
                  <Copy size={14} /> Duplicate Block
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
                      {actionLoading ? <Spinner size={14} /> : 'Confirm Delete'}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-danger" style={{ marginTop: 'auto' }} onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={14} /> Delete Block
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Danger zone — always show delete for active blocks (with strong warning) */}
        {!completed && (
          <div className="bp-danger-zone fade-in">
            <h3 className="bp-danger-title"><Trash2 size={14} /> Danger Zone</h3>
            <p>This block is currently <strong>locked</strong>. Deleting it will permanently remove all tracking data.</p>
            {showDeleteConfirm ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-danger" onClick={handleDelete} disabled={actionLoading}>
                  {actionLoading ? <Spinner size={14} /> : 'Yes, Delete Forever'}
                </button>
                <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn-danger" style={{ marginTop: 12 }} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={14} /> Delete Block
              </button>
            )}
          </div>
        )}
      </main>

      <BottomNav onCreateBlock={() => navigate('/')} />
    </div>
  );
}

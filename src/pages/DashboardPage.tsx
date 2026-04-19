import { useState, useEffect } from 'react';
import type { Block, DayLog } from '../types';
import { subscribeBlocks, subscribeLogs } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import BlockCard from '../components/BlockCard';
import CreateBlockModal from '../components/CreateBlockModal';
import Spinner from '../components/Spinner';
import { Plus, Flame, TrendingUp, CheckCircle2, Zap } from 'lucide-react';
import { isBlockActive, isBlockCompleted, computeBlockStats } from '../utils';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [logsMap, setLogsMap] = useState<Record<string, DayLog[]>>({});
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeBlocks(user.uid, (b) => {
      setBlocks(b);
      setLoadingBlocks(false);
    });
    return unsub;
  }, [user]);

  // Subscribe to logs for each block
  useEffect(() => {
    if (!user || blocks.length === 0) return;
    const unsubs: (() => void)[] = [];
    blocks.forEach(block => {
      const unsub = subscribeLogs(user.uid, block.id, (logs) => {
        setLogsMap(prev => ({ ...prev, [block.id]: logs }));
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach(u => u());
  }, [user, blocks]);

  // Aggregate stats
  const activeBlocks = blocks.filter(isBlockActive);
  const completedBlocks = blocks.filter(isBlockCompleted);
  const totalStreak = activeBlocks.reduce((acc, b) => {
    const stats = computeBlockStats(b, logsMap[b.id] ?? []);
    return acc + stats.currentStreak;
  }, 0);
  const avgSuccess = (() => {
    if (blocks.length === 0) return 0;
    const percents = blocks.map(b => computeBlockStats(b, logsMap[b.id] ?? []).overallPercent);
    return Math.round(percents.reduce((a, c) => a + c, 0) / percents.length);
  })();

  const filteredBlocks = blocks.filter(b => {
    if (filter === 'active') return isBlockActive(b) || (!isBlockCompleted(b) && !isBlockActive(b));
    if (filter === 'completed') return isBlockCompleted(b);
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dash-header">
          <div className="dash-header-left">
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Track your locked discipline blocks</p>
          </div>
          <button
            className="btn-primary dash-create-btn"
            onClick={() => setShowCreate(true)}
            id="create-block-btn"
          >
            <Plus size={16} />
            New Block
          </button>
        </header>

        {/* Stats Strip */}
        <div className="dash-stats-strip fade-in">
          <div className="dash-stat-card">
            <div className="dsc-icon" style={{ background: 'rgba(124,92,252,0.15)', color: 'var(--accent)' }}>
              <Flame size={18} />
            </div>
            <div>
              <p className="dsc-val">{activeBlocks.length}</p>
              <p className="dsc-label">Active Blocks</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dsc-icon" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="dsc-val">{completedBlocks.length}</p>
              <p className="dsc-label">Completed</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dsc-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--yellow)' }}>
              <Zap size={18} />
            </div>
            <div>
              <p className="dsc-val">{totalStreak}</p>
              <p className="dsc-label">Total Streak</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dsc-icon" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="dsc-val">{avgSuccess}%</p>
              <p className="dsc-label">Avg Success</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="dash-filter-row">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              className={`dash-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="dash-count">{blocks.length}</span>}
              {f === 'active' && <span className="dash-count">{activeBlocks.length}</span>}
              {f === 'completed' && <span className="dash-count">{completedBlocks.length}</span>}
            </button>
          ))}
        </div>

        {/* Blocks Grid */}
        {loadingBlocks ? (
          <div className="dash-loading">
            <Spinner size={32} />
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="dash-empty fade-in">
            <div className="dash-empty-icon">🔒</div>
            <h3>No blocks yet</h3>
            <p>Create your first discipline block to start your journey</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Block
            </button>
          </div>
        ) : (
          <div className="dash-grid fade-in">
            {filteredBlocks.map(block => (
              <BlockCard
                key={block.id}
                block={block}
                logs={logsMap[block.id] ?? []}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav onCreateBlock={() => setShowCreate(true)} />

      {showCreate && <CreateBlockModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

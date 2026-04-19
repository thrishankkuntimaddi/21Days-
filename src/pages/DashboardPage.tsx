import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Block, DayLog } from '../types';
import { subscribeBlocks, subscribeLogs } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import BlockCard from '../components/BlockCard';
import CreateBlockModal from '../components/CreateBlockModal';
import Spinner from '../components/Spinner';
import { Plus, Settings } from 'lucide-react';
import { isBlockActive, isBlockCompleted, computeBlockStats } from '../utils';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blocks, setBlocks]         = useState<Block[]>([]);
  const [logsMap, setLogsMap]       = useState<Record<string, DayLog[]>>({});
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]         = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;
    return subscribeBlocks(user.uid, (b) => { setBlocks(b); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (!user || blocks.length === 0) return;
    const unsubs: (() => void)[] = [];
    blocks.forEach(block => {
      unsubs.push(subscribeLogs(user.uid, block.id, (logs) =>
        setLogsMap(prev => ({ ...prev, [block.id]: logs }))
      ));
    });
    return () => unsubs.forEach(u => u());
  }, [user, blocks]);


  const activeBlocks    = blocks.filter(isBlockActive);
  const completedBlocks = blocks.filter(isBlockCompleted);
  const totalStreak     = activeBlocks.reduce((acc, b) =>
    acc + computeBlockStats(b, logsMap[b.id] ?? []).currentStreak, 0);
  const avgSuccess = blocks.length === 0 ? 0 : Math.round(
    blocks.map(b => computeBlockStats(b, logsMap[b.id] ?? []).overallPercent)
          .reduce((a, c) => a + c, 0) / blocks.length
  );

  const filteredBlocks = blocks.filter(b => {
    if (filter === 'active')    return isBlockActive(b) || (!isBlockCompleted(b) && !isBlockActive(b));
    if (filter === 'completed') return isBlockCompleted(b);
    return true;
  });

  const todayFull = format(new Date(), 'EEEE, d MMMM');
  const year      = format(new Date(), 'yyyy');

  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <Sidebar />

      <main className="dash-main">

        {/* ── Top bar ── */}
        <header className="dash-header">
          <div className="dash-header-left">
            <div className="dash-logo-mark">🔥</div>
            <span className="dash-logo-name">21Days<strong>+</strong></span>
          </div>
          <div className="dash-header-right">
            <button className="dash-icon-btn" onClick={() => navigate('/settings')} title="Settings">
              <Settings size={16} />
            </button>
            <button
              className="dash-new-btn"
              onClick={() => setShowCreate(true)}
              id="create-block-btn"
            >
              <Plus size={14} /> New Block
            </button>
          </div>
        </header>

        {/* ── Date section ── */}
        <div className="dash-date-section">
          <p className="dash-date-day">{todayFull}</p>
          <p className="dash-date-year">{year}</p>
        </div>

        {/* ── Stats grid ── */}
        <div className="dash-stats-grid">
          <div className="dash-stat-item">
            <span className="dash-stat-num" style={{ color: 'var(--accent)' }}>{activeBlocks.length}</span>
            <span className="dash-stat-lbl">Active</span>
          </div>
          <div className="dash-stat-item">
            <span className="dash-stat-num" style={{ color: 'var(--green)' }}>{completedBlocks.length}</span>
            <span className="dash-stat-lbl">Completed</span>
          </div>
          <div className="dash-stat-item">
            <span className="dash-stat-num" style={{ color: 'var(--yellow)' }}>{totalStreak}</span>
            <span className="dash-stat-lbl">Streak days</span>
          </div>
          <div className="dash-stat-item">
            <span className="dash-stat-num">{avgSuccess}%</span>
            <span className="dash-stat-lbl">Avg success</span>
          </div>
        </div>

        {/* ── Segmented tabs ── */}
        <div className="dash-tabs">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              className={`dash-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="dash-tab-pill">
                {f === 'all' ? blocks.length : f === 'active' ? activeBlocks.length : completedBlocks.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="dash-content">
          {loading ? (
            <div className="dash-loading"><Spinner size={28} /></div>
          ) : filteredBlocks.length === 0 ? (
            <div className="dash-empty fade-in">
              <div className="dash-empty-icon">🔒</div>
              <h3>No blocks yet</h3>
              <p>Create your first discipline block to start your journey</p>
              <button className="dash-empty-btn" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> Create Block
              </button>
            </div>
          ) : (
            <div className="dash-grid fade-in">
              {filteredBlocks.map(block => (
                <BlockCard key={block.id} block={block} logs={logsMap[block.id] ?? []} />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Mobile bottom nav */}
      <BottomNav onCreateBlock={() => setShowCreate(true)} />

      {showCreate && <CreateBlockModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

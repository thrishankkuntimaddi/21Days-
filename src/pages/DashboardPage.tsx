import { useState, useEffect } from 'react';
import type { Block, DayLog } from '../types';
import { subscribeBlocks, subscribeLogs } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import BottomNav from '../components/BottomNav';
import BlockCard from '../components/BlockCard';
import CreateBlockModal from '../components/CreateBlockModal';
import Spinner from '../components/Spinner';
import { Plus, Flame, Sun, Moon, LogOut } from 'lucide-react';
import { isBlockActive, isBlockCompleted, computeBlockStats } from '../utils';
import toast from 'react-hot-toast';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
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

  async function handleLogout() {
    await signOut(auth);
    toast.success('Signed out');
  }

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

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Flame size={15} color="var(--accent)" /></div>
          <span className="logo-text">21Days<span>+</span></span>
        </div>
        <nav className="sidebar-nav">
          <a href="/" className="sidebar-link active">
            <span>Dashboard</span>
          </a>
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

      {/* Main content */}
      <main className="dashboard-main" style={{ flex: 1 }}>

        {/* Top bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <div className="dash-topbar-logo">
              <div className="dash-topbar-logo-icon">
                <Flame size={14} color="#fff" />
              </div>
              <span className="dash-topbar-brand">21Days<span>+</span></span>
            </div>
            <div className="dash-topbar-divider" />
            <span className="dash-topbar-title">Dashboard</span>
          </div>

          <div className="dash-topbar-right">
            {/* User chip — desktop */}
            <div className="dash-user-chip">
              <div className="dash-user-avatar">{initials}</div>
              <span className="dash-user-email">{user?.email}</span>
            </div>

            {/* Theme toggle */}
            <button className="dash-theme-btn" onClick={toggle} title="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* New Block */}
            <button
              className="dash-new-btn"
              onClick={() => setShowCreate(true)}
              id="create-block-btn"
            >
              <Plus size={14} />
              New Block
            </button>
          </div>
        </header>

        {/* Stats row */}
        <div className="dash-stats-row">
          <div className="dash-stat">
            <span className="dash-stat-num">{activeBlocks.length}</span>
            <span className="dash-stat-label">Active</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{completedBlocks.length}</span>
            <span className="dash-stat-label">Completed</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{totalStreak}</span>
            <span className="dash-stat-label">Streak Days</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{avgSuccess}%</span>
            <span className="dash-stat-label">Avg Success</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="dash-tabs">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              className={`dash-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="dash-tab-count">
                {f === 'all' ? blocks.length : f === 'active' ? activeBlocks.length : completedBlocks.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="dash-content">
          {loadingBlocks ? (
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

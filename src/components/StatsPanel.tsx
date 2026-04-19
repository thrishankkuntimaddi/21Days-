import type { Block, BlockStats, DayLog } from '../types';
import { getBlockDates, getTodayString } from '../utils';
import { Flame, TrendingUp, Target, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './StatsPanel.css';

interface Props {
  block: Block;
  logs: DayLog[];
  stats: BlockStats;
}

export default function StatsPanel({ block, logs, stats }: Props) {
  const dates = getBlockDates(block);
  const today = getTodayString();
  const pastDates = dates.filter(d => d <= today);
  const logMap: Record<string, DayLog> = {};
  logs.forEach(l => { logMap[l.date] = l; });

  // Per-task stats
  const taskStats = block.tasks.map(task => {
    let done = 0;
    let missed = 0;
    pastDates.forEach(d => {
      const log = logMap[d];
      if (log) {
        if (log.completions[task.id]) done++;
        else missed++;
      } else {
        missed++;
      }
    });
    const pct = pastDates.length > 0 ? Math.round((done / pastDates.length) * 100) : 0;
    return { ...task, done, missed, pct };
  });

  // Daily % trend (last 7 days)
  const recentDates = pastDates.slice(-7);
  const recentPercents = recentDates.map(d => {
    const log = logMap[d];
    if (!log || block.tasks.length === 0) return 0;
    const done = block.tasks.filter(t => log.completions[t.id]).length;
    return Math.round((done / block.tasks.length) * 100);
  });

  const totalTracked = pastDates.length;
  const perfectDays = stats.completedDays;

  return (
    <div className="sp-root">
      <h3 className="sp-title">📊 Detailed Statistics</h3>

      {/* Overview cards */}
      <div className="sp-overview">
        <div className="sp-ov-card">
          <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
          <div>
            <p className="sp-ov-val" style={{ color: 'var(--green)' }}>{perfectDays}</p>
            <p className="sp-ov-label">Perfect Days</p>
          </div>
        </div>
        <div className="sp-ov-card">
          <XCircle size={16} style={{ color: 'var(--red)' }} />
          <div>
            <p className="sp-ov-val" style={{ color: 'var(--red)' }}>{totalTracked - perfectDays}</p>
            <p className="sp-ov-label">Imperfect Days</p>
          </div>
        </div>
        <div className="sp-ov-card">
          <Flame size={16} style={{ color: 'var(--yellow)' }} />
          <div>
            <p className="sp-ov-val" style={{ color: 'var(--yellow)' }}>{stats.currentStreak}</p>
            <p className="sp-ov-label">Current Streak</p>
          </div>
        </div>
        <div className="sp-ov-card">
          <Target size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <p className="sp-ov-val" style={{ color: 'var(--accent)' }}>{stats.longestStreak}</p>
            <p className="sp-ov-label">Best Streak</p>
          </div>
        </div>
        <div className="sp-ov-card">
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <p className="sp-ov-val">{totalTracked} / {block.duration}</p>
            <p className="sp-ov-label">Days Elapsed</p>
          </div>
        </div>
        <div className="sp-ov-card">
          <TrendingUp size={16} style={{ color: 'var(--green)' }} />
          <div>
            <p className="sp-ov-val">{stats.overallPercent}%</p>
            <p className="sp-ov-label">Overall Rate</p>
          </div>
        </div>
      </div>

      {/* Recent trend bar (last 7 days) */}
      {recentDates.length > 0 && (
        <div className="sp-trend">
          <h4 className="sp-sub-title">Last 7 Days Trend</h4>
          <div className="sp-trend-bars">
            {recentDates.map((d, i) => {
              const pct = recentPercents[i];
              const color = pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div key={d} className="sp-trend-col">
                  <div className="sp-trend-bar-wrap">
                    <div
                      className="sp-trend-bar-fill"
                      style={{ height: `${Math.max(4, pct)}%`, background: color, boxShadow: `0 0 8px ${color}55` }}
                    />
                  </div>
                  <span className="sp-trend-day">{new Date(d).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}</span>
                  <span className="sp-trend-pct" style={{ color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-task breakdown */}
      <div className="sp-tasks">
        <h4 className="sp-sub-title">Per-Task Breakdown</h4>
        <div className="sp-task-list">
          {taskStats.map(ts => (
            <div key={ts.id} className="sp-task-row">
              <span className={`sp-task-badge ${ts.type}`}>{ts.type === 'do' ? '✅' : '🚫'}</span>
              <span className="sp-task-text">{ts.text}</span>
              <div className="sp-task-bar-wrap">
                <div
                  className="sp-task-bar-fill"
                  style={{
                    width: `${ts.pct}%`,
                    background: ts.pct >= 80 ? 'var(--green)' : ts.pct >= 50 ? 'var(--yellow)' : 'var(--red)',
                  }}
                />
              </div>
              <span className={`sp-task-pct ${ts.pct >= 80 ? 'good' : ts.pct >= 50 ? 'mid' : 'bad'}`}>
                {ts.pct}%
              </span>
              <span className="sp-task-detail">{ts.done}✓ {ts.missed}✗</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

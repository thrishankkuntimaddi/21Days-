import { useNavigate } from 'react-router-dom';
import type { Block, DayLog } from '../types';
import { computeBlockStats, formatDate, isBlockCompleted, isBlockFuture } from '../utils';
import { Calendar, Lock, ChevronRight, Flame } from 'lucide-react';
import './BlockCard.css';

interface Props {
  block: Block;
  logs: DayLog[];
}

export default function BlockCard({ block, logs }: Props) {
  const navigate = useNavigate();
  const stats = computeBlockStats(block, logs);
  const completed = isBlockCompleted(block);
  const future = isBlockFuture(block);

  const statusLabel = future ? 'Upcoming' : completed ? 'Completed' : 'Active';
  const statusClass = future ? 'status-future' : completed ? 'status-done' : 'status-active';

  const endDate = (() => {
    const d = new Date(block.startDate);
    d.setDate(d.getDate() + block.duration - 1);
    return d.toISOString().slice(0, 10);
  })();

  const progressColor = stats.overallPercent >= 80
    ? 'var(--green)'
    : stats.overallPercent >= 50
    ? 'var(--yellow)'
    : 'var(--red)';

  const doTasks = block.tasks.filter(t => t.type === 'do');
  const dontTasks = block.tasks.filter(t => t.type === 'dont');

  return (
    <article
      className="block-card fade-in"
      onClick={() => navigate(`/block/${block.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/block/${block.id}`)}
    >
      {/* Header */}
      <div className="bc-header">
        <div className="bc-title-row">
          <span className={`bc-status ${statusClass}`}>{statusLabel}</span>
          {block.locked && <span className="bc-lock"><Lock size={11} /> Locked</span>}
        </div>
        <h3 className="bc-title">{block.title}</h3>
      </div>

      {/* Stats Row */}
      <div className="bc-stats">
        <div className="bc-stat">
          <span className="bc-stat-val">{block.duration}</span>
          <span className="bc-stat-label">days</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val" style={{ color: 'var(--green)' }}>{stats.completedDays}</span>
          <span className="bc-stat-label">perfect</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val" style={{ color: 'var(--yellow)' }}>
            <Flame size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            {stats.currentStreak}
          </span>
          <span className="bc-stat-label">streak</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val" style={{ color: progressColor }}>{stats.overallPercent}%</span>
          <span className="bc-stat-label">success</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track" style={{ marginTop: 12 }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${stats.overallPercent}%`,
            background: progressColor,
            boxShadow: `0 0 8px ${progressColor}55`,
          }}
        />
      </div>

      {/* Dates & Tasks */}
      <div className="bc-footer">
        <div className="bc-dates">
          <Calendar size={13} />
          <span>{formatDate(block.startDate)} → {formatDate(endDate)}</span>
        </div>
        <div className="bc-task-count">
          <span className="tag-do">{doTasks.length} DO</span>
          <span className="tag-dont">{dontTasks.length} DON'T</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="bc-arrow">
        <ChevronRight size={16} />
      </div>
    </article>
  );
}

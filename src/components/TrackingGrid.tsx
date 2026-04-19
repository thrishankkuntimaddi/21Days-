import { useState } from 'react';
import type { Block, DayLog } from '../types';
import { getBlockDates, getTodayString, formatDay } from '../utils';
import { toggleTask, saveNote } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Circle, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './TrackingGrid.css';

interface Props {
  block: Block;
  logs: DayLog[];
}

const MOBILE_PAGE = 7; // show 7 days at a time on mobile

export default function TrackingGrid({ block, logs }: Props) {
  const { user } = useAuth();
  const today = getTodayString();
  const dates = getBlockDates(block);
  const [noteDate, setNoteDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(() => {
    const idx = dates.indexOf(today);
    return idx >= 0 ? Math.floor(idx / MOBILE_PAGE) : 0;
  });

  const logMap: Record<string, DayLog> = {};
  logs.forEach(l => { logMap[l.date] = l; });

  async function handleToggle(date: string, taskId: string) {
    if (!user) return;
    if (date > today) { toast('This day hasn\'t arrived yet ⏳', { icon: '🕐' }); return; }
    const current = logMap[date]?.completions?.[taskId] ?? false;
    try {
      await toggleTask(user.uid, block.id, date, taskId, !current);
    } catch {
      toast.error('Failed to save');
    }
  }

  async function handleSaveNote(date: string) {
    if (!user) return;
    setSaving(true);
    try {
      await saveNote(user.uid, block.id, date, noteText);
      toast.success('Note saved');
      setNoteDate(null);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  }

  function openNote(date: string) {
    setNoteDate(date);
    setNoteText(logMap[date]?.note ?? '');
  }

  function cellClass(date: string, taskId: string): string {
    if (date > today) return 'tg-cell future';
    const done = logMap[date]?.completions?.[taskId];
    if (done) return 'tg-cell done';
    return 'tg-cell missed';
  }

  // Mobile: paginated 7-day view
  const totalPages = Math.ceil(dates.length / MOBILE_PAGE);
  const pagedDates = dates.slice(page * MOBILE_PAGE, (page + 1) * MOBILE_PAGE);

  return (
    <div className="tg-wrapper">
      {/* Mobile pagination */}
      <div className="tg-pagination">
        <button
          className="tg-page-btn"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="tg-page-label">
          Days {page * MOBILE_PAGE + 1}–{Math.min((page + 1) * MOBILE_PAGE, dates.length)}
          <span className="tg-page-sep">/</span>
          {dates.length}
        </span>
        <button
          className="tg-page-btn"
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Scrollable grid area */}
      <div className="tg-scroll">
        <table className="tg-table">
          <thead>
            <tr>
              <th className="tg-th-task">Task</th>
              {/* Desktop: all dates */}
              {dates.map((d, i) => (
                <th
                  key={d}
                  className={`tg-th-day desktop-only ${d === today ? 'tg-today-col' : ''}`}
                >
                  <div className="tg-day-label">
                    <span className="tg-day-num">D{i + 1}</span>
                    <span className="tg-day-name">{formatDay(d)}</span>
                  </div>
                </th>
              ))}
              {/* Mobile: paginated */}
              {pagedDates.map((d, i) => (
                <th
                  key={`m-${d}`}
                  className={`tg-th-day mobile-only ${d === today ? 'tg-today-col' : ''}`}
                >
                  <div className="tg-day-label">
                    <span className="tg-day-num">D{page * MOBILE_PAGE + i + 1}</span>
                    <span className="tg-day-name">{formatDay(d)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.tasks.map(task => (
              <tr key={task.id} className="tg-row">
                <td className="tg-td-task">
                  <div className="tg-task-info">
                    <span className={`tg-task-badge ${task.type}`}>
                      {task.type === 'do' ? '✅' : '🚫'}
                    </span>
                    <span className="tg-task-text">{task.text}</span>
                  </div>
                </td>
                {/* Desktop: all */}
                {dates.map(d => (
                  <td key={d} className={`${cellClass(d, task.id)} desktop-only`}>
                    <button
                      className="tg-cell-btn"
                      onClick={() => handleToggle(d, task.id)}
                      title={d > today ? 'Future day' : logMap[d]?.completions?.[task.id] ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {d > today
                        ? null
                        : logMap[d]?.completions?.[task.id]
                        ? <CheckCircle2 size={14} />
                        : <Circle size={14} />
                      }
                    </button>
                  </td>
                ))}
                {/* Mobile: paginated */}
                {pagedDates.map(d => (
                  <td key={`m-${d}`} className={`${cellClass(d, task.id)} mobile-only`}>
                    <button
                      className="tg-cell-btn"
                      onClick={() => handleToggle(d, task.id)}
                    >
                      {d > today
                        ? null
                        : logMap[d]?.completions?.[task.id]
                        ? <CheckCircle2 size={14} />
                        : <Circle size={14} />
                      }
                    </button>
                  </td>
                ))}
              </tr>
            ))}

            {/* Notes row */}
            <tr className="tg-row tg-notes-row">
              <td className="tg-td-task">
                <span className="tg-task-text" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Notes
                </span>
              </td>
              {dates.map(d => (
                <td key={d} className="tg-cell desktop-only" style={{ cursor: 'pointer' }}>
                  <button
                    className="tg-cell-btn tg-note-btn"
                    onClick={() => openNote(d)}
                    title="Add / view note"
                  >
                    {logMap[d]?.note ? '📝' : d <= today ? '＋' : ''}
                  </button>
                </td>
              ))}
              {pagedDates.map(d => (
                <td key={`mn-${d}`} className="tg-cell mobile-only" style={{ cursor: 'pointer' }}>
                  <button
                    className="tg-cell-btn tg-note-btn"
                    onClick={() => openNote(d)}
                  >
                    {logMap[d]?.note ? '📝' : d <= today ? '＋' : ''}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note modal */}
      {noteDate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setNoteDate(null)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 17 }}>
              📝 Note — {noteDate}
            </h3>
            <textarea
              className="input tg-note-area"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your reflection for this day..."
              rows={5}
              disabled={noteDate > today}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setNoteDate(null)}>Cancel</button>
              {noteDate <= today && (
                <button className="btn-primary" onClick={() => handleSaveNote(noteDate)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

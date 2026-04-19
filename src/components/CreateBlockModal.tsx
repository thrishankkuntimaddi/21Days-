import { useState } from 'react';
import { X, Plus, Trash2, Flame } from 'lucide-react';
import type { Task } from '../types';
import { createBlock } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import './CreateBlockModal.css';

interface Prefill {
  title?: string;
  duration?: number;
  tasks?: Task[];
}

interface Props {
  onClose: () => void;
  prefill?: Prefill;
}

export default function CreateBlockModal({ onClose, prefill }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(prefill?.duration ?? 21);
  const [doInput, setDoInput] = useState('');
  const [dontInput, setDontInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>(
    prefill?.tasks?.map(t => ({ ...t, id: crypto.randomUUID() })) ?? []
  );
  const [loading, setLoading] = useState(false);

  function addTask(type: 'do' | 'dont') {
    const txt = type === 'do' ? doInput.trim() : dontInput.trim();
    if (!txt) return;
    const newTask: Task = { id: crypto.randomUUID(), text: txt, type };
    setTasks(prev => [...prev, newTask]);
    if (type === 'do') setDoInput(''); else setDontInput('');
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { toast.error('Block title required'); return; }
    if (tasks.length === 0) { toast.error('Add at least one task'); return; }

    setLoading(true);
    try {
      await createBlock(user.uid, {
        title: title.trim(),
        startDate,
        duration,
        tasks,
      });
      toast.success('Block created & locked 🔒');
      onClose();
    } catch (err) {
      toast.error('Failed to create block');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const doTasks = tasks.filter(t => t.type === 'do');
  const dontTasks = tasks.filter(t => t.type === 'dont');

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box cbm-box">
        {/* Header */}
        <div className="cbm-header">
          <div className="cbm-header-left">
            <div className="cbm-icon"><Flame size={18} color="#7c5cfc" /></div>
            <div>
              <h2 className="cbm-title">{prefill ? 'Duplicate Block' : 'Create New Block'}</h2>
              <p className="cbm-subtitle">Define your commitment — it locks on creation</p>
            </div>
          </div>
          <button className="cbm-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="cbm-form">
          {/* Title */}
          <div className="cbm-field">
            <label className="label">Block Title</label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Discipline Block"
              required
            />
          </div>

          {/* Start date + Duration */}
          <div className="cbm-row">
            <div className="cbm-field">
              <label className="label">Start Date</label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="cbm-field">
              <label className="label">Duration (days)</label>
              <input
                className="input"
                type="number"
                min={1}
                max={365}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* DO tasks */}
          <div className="cbm-field">
            <label className="label">✅ DO Tasks</label>
            <div className="cbm-task-input">
              <input
                className="input"
                value={doInput}
                onChange={e => setDoInput(e.target.value)}
                placeholder="Add a habit to build..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask('do'))}
              />
              <button type="button" className="btn-primary cbm-add-btn" onClick={() => addTask('do')}>
                <Plus size={16} />
              </button>
            </div>
            {doTasks.length > 0 && (
              <ul className="cbm-task-list">
                {doTasks.map(t => (
                  <li key={t.id} className="cbm-task-item do">
                    <span>{t.text}</span>
                    <button type="button" onClick={() => removeTask(t.id)} className="cbm-remove">
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* DON'T tasks */}
          <div className="cbm-field">
            <label className="label">🚫 DON'T Tasks</label>
            <div className="cbm-task-input">
              <input
                className="input"
                value={dontInput}
                onChange={e => setDontInput(e.target.value)}
                placeholder="Add a habit to break..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask('dont'))}
              />
              <button type="button" className="btn-primary cbm-add-btn" onClick={() => addTask('dont')}>
                <Plus size={16} />
              </button>
            </div>
            {dontTasks.length > 0 && (
              <ul className="cbm-task-list">
                {dontTasks.map(t => (
                  <li key={t.id} className="cbm-task-item dont">
                    <span>{t.text}</span>
                    <button type="button" onClick={() => removeTask(t.id)} className="cbm-remove">
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Lock Warning */}
          <div className="cbm-warning">
            <LockIcon size={14} />
            <span>Once created, tasks are <strong>permanently locked</strong> until completion.</span>
          </div>

          {/* Actions */}
          <div className="cbm-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner size={16} /> : <><Flame size={16} />{prefill ? 'Duplicate & Lock' : 'Commit & Lock'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline Lock icon
function LockIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

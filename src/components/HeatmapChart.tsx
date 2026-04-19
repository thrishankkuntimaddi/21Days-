import type { Block, DayLog } from '../types';
import { getBlockDates, getTodayString } from '../utils';
import './HeatmapChart.css';

interface Props {
  block: Block;
  logs: DayLog[];
}

function getTooltip(date: string, pct: number, isFuture: boolean): string {
  if (isFuture) return `${date} — Future`;
  if (pct === -1) return `${date} — No data`;
  return `${date} — ${pct}%`;
}

export default function HeatmapChart({ block, logs }: Props) {
  const dates = getBlockDates(block);
  const today = getTodayString();
  const logMap: Record<string, DayLog> = {};
  logs.forEach(l => { logMap[l.date] = l; });

  // Group into weeks (rows of 7)
  const weeks: string[][] = [];
  let week: string[] = [];
  dates.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === dates.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  function getCellColor(date: string): string {
    if (date > today) return 'hm-future';
    const log = logMap[date];
    if (!log || block.tasks.length === 0) return 'hm-empty';
    const done = block.tasks.filter(t => log.completions[t.id]).length;
    const pct = done / block.tasks.length;
    if (pct === 1) return 'hm-full';
    if (pct >= 0.75) return 'hm-high';
    if (pct >= 0.5) return 'hm-mid';
    if (pct > 0) return 'hm-low';
    return 'hm-miss';
  }

  function getPct(date: string): number {
    const log = logMap[date];
    if (!log || block.tasks.length === 0) return -1;
    const done = block.tasks.filter(t => log.completions[t.id]).length;
    return Math.round((done / block.tasks.length) * 100);
  }

  return (
    <div className="hm-root">
      <h3 className="hm-title">📈 Progress Heatmap</h3>
      <p className="hm-subtitle">Each cell = one day. Color intensity = completion rate.</p>

      <div className="hm-grid">
        {weeks.map((wk, wi) => (
          <div key={wi} className="hm-week">
            <span className="hm-week-label">W{wi + 1}</span>
            <div className="hm-cells">
              {wk.map((d, di) => {
                const isFuture = d > today;
                const pct = getPct(d);
                const dayIndex = wi * 7 + di + 1;
                return (
                  <div
                    key={d}
                    className={`hm-cell ${getCellColor(d)} ${d === today ? 'hm-today' : ''}`}
                    title={getTooltip(d, pct, isFuture)}
                    aria-label={`Day ${dayIndex}: ${d}`}
                  >
                    <span className="hm-cell-label">D{dayIndex}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="hm-legend">
        <span className="hm-legend-label">Less</span>
        <div className="hm-legend-cells">
          <div className="hm-cell hm-miss hm-legend-cell" title="0%" />
          <div className="hm-cell hm-low hm-legend-cell" title="1–49%" />
          <div className="hm-cell hm-mid hm-legend-cell" title="50–74%" />
          <div className="hm-cell hm-high hm-legend-cell" title="75–99%" />
          <div className="hm-cell hm-full hm-legend-cell" title="100%" />
        </div>
        <span className="hm-legend-label">More</span>
      </div>

      {/* Day labels legend */}
      <div className="hm-pct-legend">
        <span className="hm-miss" style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: 'var(--red)', fontSize: 11 }}>0% — Miss</span>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)', fontSize: 11 }}>1–74% — Partial</span>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: 'var(--green)', fontSize: 11 }}>75–100% — Strong</span>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.3)', color: 'var(--green)', fontSize: 11 }}>100% — Perfect</span>
      </div>
    </div>
  );
}

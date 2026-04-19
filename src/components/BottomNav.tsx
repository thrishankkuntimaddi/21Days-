import { NavLink } from 'react-router-dom';
import { Plus, Settings, LayoutDashboard } from 'lucide-react';
import './BottomNav.css';

interface Props {
  onCreateBlock?: () => void;
}

export default function BottomNav({ onCreateBlock }: Props) {
  return (
    <nav className="bottom-nav">
      {/* Left: Home */}
      <div className="bnav-side">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
      </div>

      {/* Center FAB */}
      {onCreateBlock && (
        <div className="bnav-fab-wrap">
          <button className="bnav-fab" onClick={onCreateBlock} aria-label="New Block">
            <Plus size={22} />
          </button>
        </div>
      )}

      {/* Right: Settings */}
      <div className="bnav-side" style={{ justifyContent: 'flex-end' }}>
        <NavLink
          to="/settings"
          className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}

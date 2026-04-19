import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import './BottomNav.css';

interface Props {
  onCreateBlock?: () => void;
}

export default function BottomNav({ onCreateBlock }: Props) {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/');
  }

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

      {/* Right: Sign out */}
      <div className="bnav-side" style={{ justifyContent: 'flex-end' }}>
        <button className="bnav-item" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

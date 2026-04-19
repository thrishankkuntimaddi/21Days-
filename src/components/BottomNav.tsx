import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import './BottomNav.css';

interface Props {
  onCreateBlock?: () => void;
}

export default function BottomNav({ onCreateBlock }: Props) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  async function handleLogout() {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      {onCreateBlock && (
        <button className="bnav-create" onClick={onCreateBlock} aria-label="Create new block">
          <Plus size={22} />
        </button>
      )}

      <button className="bnav-item" onClick={toggle} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      <button className="bnav-item" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Out</span>
      </button>
    </nav>
  );
}

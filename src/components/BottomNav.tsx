import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, LogOut } from 'lucide-react';
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
      <NavLink to="/" end className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      {onCreateBlock && (
        <button className="bnav-create" onClick={onCreateBlock} aria-label="Create new block">
          <Plus size={22} />
        </button>
      )}

      <button className="bnav-item" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </nav>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, LogOut, Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/');
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Flame size={18} color="#7c5cfc" />
        </div>
        <span className="logo-text">21Days<span>+</span></span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button className="sidebar-signout" onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, LogOut, Flame, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
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
          <Flame size={16} color="var(--accent)" />
        </div>
        <span className="logo-text">21Days<span>+</span></span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
      </nav>

      {/* Theme toggle */}
      <button className="sidebar-theme-toggle" onClick={toggle}>
        {theme === 'dark'
          ? <><Sun size={14} /> Light Mode</>
          : <><Moon size={14} /> Dark Mode</>
        }
      </button>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button className="sidebar-signout" onClick={handleLogout} title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BlockPage from './pages/BlockPage';
import Spinner from './components/Spinner';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/block/:blockId" element={<BlockPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

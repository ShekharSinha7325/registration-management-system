import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) return null;

  // Logged-in admin: show only the dashboard, never the public form
  if (user) return <AdminDashboard />;

  // Admin clicked "Administration Login": show the login form
  if (showLogin) return <Login onCancel={() => setShowLogin(false)} />;

  // Default: public registration form, with a small admin entry point
  return (
    <div className="hero">
      <div className="hero-decor hero-decor-1">📖</div>
      <div className="hero-decor hero-decor-2">🔖</div>
      <div className="hero-decor hero-decor-3">✒️</div>
      <button className="admin-corner-btn" onClick={() => setShowLogin(true)}>
        🔑 Administration Login
      </button>
      <div className="hero-header">
        <div className="hero-emblem">📚</div>
        <h1>City Public Library</h1>
        <p>Join our community of readers — register below to become a member.</p>
        <div className="hero-stats">
          <div className="hero-stat"><strong>12,000+</strong><span>Books</span></div>
          <div className="hero-stat"><strong>3,400+</strong><span>Members</span></div>
          <div className="hero-stat"><strong>Free</strong><span>Membership</span></div>
        </div>
      </div>
      <RegistrationForm />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

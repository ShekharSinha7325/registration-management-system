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
      <button className="admin-corner-btn" onClick={() => setShowLogin(true)}>
        Administration Login
      </button>
      <div className="hero-header">
        <h1>📚 City Public Library</h1>
        <p>Register below to become a library member.</p>
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

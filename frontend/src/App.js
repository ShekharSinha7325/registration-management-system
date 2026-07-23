import { useEffect, useState, useCallback } from 'react';
import { getRegistrations } from './api';
import RegistrationForm from './components/RegistrationForm';
import RegistrationList from './components/RegistrationList';
import './App.css';

export default function App() {
  const [registrations, setRegistrations] = useState([]);

  const load = useCallback(async () => {
    const res = await getRegistrations();
    setRegistrations(res.data.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="app">
      <h1>Registration Management System</h1>
      <RegistrationForm onCreated={load} />
      <RegistrationList registrations={registrations} onChange={load} />
    </div>
  );
}

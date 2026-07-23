import { useState } from 'react';
import { createRegistration } from '../api';

const initialState = { fullName: '', email: '', phone: '', dob: '', course: '', address: '' };

export default function RegistrationForm({ onCreated }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createRegistration(form);
      setForm(initialState);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>New Registration</h2>
      {error && <p className="error">{error}</p>}
      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
      <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
      <input name="course" placeholder="Course" value={form.course} onChange={handleChange} required />
      <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Register'}</button>
    </form>
  );
}

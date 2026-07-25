import { useEffect, useState, useCallback } from 'react';
import { getRegistrations, deleteRegistration, updateRegistration } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRegistrations({ search: search || undefined, status: statusFilter || undefined });
      setRegistrations(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    await deleteRegistration(id);
    load();
  };

  const handleStatus = async (id, status) => {
    await updateRegistration(id, { status });
    load();
  };

  return (
    <div className="page-content">
      <div className="admin-header">
        <div>
          <h1>Administration Dashboard</h1>
          <p className="form-subtitle">Logged in as {user?.username} — {registrations.length} applications</p>
        </div>
        <button className="navbar-logout" onClick={logout}>Logout</button>
      </div>

      <div className="admin-filters">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="registration-table">
          <thead>
            <tr>
              <th>Name</th><th>Father's Name</th><th>Email</th><th>Phone</th>
              <th>Qualification</th><th>Course</th><th>Type</th><th>ID Proof</th>
              <th>Address</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r._id}>
                <td>{r.fullName}</td>
                <td>{r.fatherName}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>{r.qualification}</td>
                <td>{r.course}</td>
                <td>{r.membershipType}</td>
                <td>{r.idProofNumber}</td>
                <td>{r.address}</td>
                <td>
                  <select value={r.status} onChange={(e) => handleStatus(r._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td><button onClick={() => handleDelete(r._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

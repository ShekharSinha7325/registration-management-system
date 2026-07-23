import { deleteRegistration, updateRegistration } from '../api';

export default function RegistrationList({ registrations, onChange }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    await deleteRegistration(id);
    onChange();
  };

  const handleStatus = async (id, status) => {
    await updateRegistration(id, { status });
    onChange();
  };

  return (
    <table className="registration-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Course</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {registrations.map((r) => (
          <tr key={r._id}>
            <td>{r.fullName}</td>
            <td>{r.email}</td>
            <td>{r.course}</td>
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
  );
}

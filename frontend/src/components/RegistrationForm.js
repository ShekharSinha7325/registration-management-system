import { useState } from 'react';
import { createRegistration } from '../api';

const initialState = {
  fullName: '',
  fatherName: '',
  email: '',
  phone: '',
  dob: '',
  qualification: '',
  course: '',
  membershipType: 'student',
  idProofNumber: '',
  address: '',
};

export default function RegistrationForm() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createRegistration(form);
      setForm(initialState);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to submit registration'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-content">
        <div className="success-box">
          <h2>Application Submitted!</h2>
          <p>
            Thank you for applying for library membership. Our administration team will
            review your application and get in touch with you soon.
          </p>
          <button onClick={() => setSuccess(false)}>Submit Another Application</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Library Membership Registration</h2>
        <p className="form-subtitle">Please fill in your details accurately.</p>
        {error && <p className="error">{error}</p>}

        <label>Full Name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required />

        <label>Father's Name</label>
        <input name="fatherName" value={form.fatherName} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Date of Birth</label>
        <input name="dob" type="date" value={form.dob} onChange={handleChange} required />

        <label>Qualification</label>
        <input
          name="qualification"
          placeholder="e.g. B.Tech, M.A., 12th Pass"
          value={form.qualification}
          onChange={handleChange}
          required
        />

        <label>Course / Occupation</label>
        <input
          name="course"
          placeholder="e.g. Computer Science, Teacher, Self-employed"
          value={form.course}
          onChange={handleChange}
          required
        />

        <label>Membership Type</label>
        <select name="membershipType" value={form.membershipType} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="general">General Public</option>
        </select>

        <label>ID Proof Number</label>
        <input
          name="idProofNumber"
          placeholder="Aadhaar / Passport / Voter ID number"
          value={form.idProofNumber}
          onChange={handleChange}
          required
        />

        <label>Full Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

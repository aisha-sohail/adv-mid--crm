import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const roleOptions = ['Admin', 'CRM Manager', 'Team Member'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team Member'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-kicker">CRM onboarding</span>
          <h2>Create an account</h2>
          <p>Set up a new user profile and assign the correct role.</p>
        </div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange('password')}
              required
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={formData.role} onChange={handleChange('role')}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="auth-footer">
          <span>Already have an account?</span> <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

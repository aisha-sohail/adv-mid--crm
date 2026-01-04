import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { STATUS_OPTIONS, getUserId } from '../../utils/helpers';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'New',
  assignedTo: [],
  notes: ''
};

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || 'Team Member';
  const userId = getUserId(user);

  const [formData, setFormData] = useState(initialForm);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const requests = [];

    if (isEdit) {
      requests.push(API.get(`/customers/${id}`));
    }

    if (role !== 'Team Member') {
      requests.push(API.get('/users/team-members'));
    }

    Promise.all(requests)
      .then((responses) => {
        if (!isMounted) return;
        const customerResponse = isEdit ? responses.shift() : null;
        if (customerResponse) {
          const customer = customerResponse.data;
          setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            status: customer.status || 'New',
            assignedTo: customer.assignedTo?.map((member) => member._id || member.id || member) || [],
            notes: customer.notes || ''
          });
        }

        const teamResponse = responses.shift();
        if (teamResponse) {
          setTeamMembers(teamResponse.data);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Unable to load customer data.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, role]);

  const title = useMemo(() => (isEdit ? 'Edit Customer' : 'New Customer'), [isEdit]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const toggleAssignment = (memberId) => {
    setFormData((prev) => {
      const assigned = prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((idValue) => idValue !== memberId)
        : [...prev.assignedTo, memberId];
      return { ...prev, assignedTo: assigned };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...formData };
    if (role === 'Team Member' && userId && !isEdit) {
      payload.assignedTo = [userId];
    }

    try {
      const response = isEdit
        ? await API.put(`/customers/${id}`, payload)
        : await API.post('/customers', payload);
      const saved = response.data;
      navigate(`/customers/${saved._id || id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to save customer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-state">Loading...</div>;

  return (
    <section className="customer-form">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="page-subtitle">Capture customer details and assign accountable owners.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
          Back to customers
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="panel form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input value={formData.name} onChange={handleChange('name')} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={formData.email} onChange={handleChange('email')} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={formData.phone} onChange={handleChange('phone')} />
          </label>
          <label className="field">
            <span>Company</span>
            <input value={formData.company} onChange={handleChange('company')} />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={formData.status} onChange={handleChange('status')}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field">
          <span>Notes</span>
          <textarea value={formData.notes} onChange={handleChange('notes')} rows="4" />
        </div>

        {role !== 'Team Member' ? (
          <div className="field">
            <span>Assign team members</span>
            {teamMembers.length === 0 ? (
              <p className="muted">No team members available for assignment.</p>
            ) : (
              <div className="checkbox-grid">
                {teamMembers.map((member) => (
                  <label key={member._id} className="checkbox">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(member._id)}
                      onChange={() => toggleAssignment(member._id)}
                    />
                    <span>{member.name} · {member.role}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="hint">
            As a Team Member, new customers are automatically assigned to you.
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/customers')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CustomerForm;

import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { STATUS_OPTIONS, getStatusClass } from '../../utils/helpers';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || 'Team Member';
  const canDelete = role === 'Admin' || role === 'CRM Manager';

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (assignedFilter) params.set('assignedTo', assignedFilter);

      const response = await API.get(`/customers?${params.toString()}`);
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Unable to load customers.');
      setLoading(false);
    }
  }, [statusFilter, assignedFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (role === 'Team Member') return;
    API.get('/users/team-members')
      .then((response) => setTeamMembers(response.data))
      .catch(() => setTeamMembers([]));
  }, [role]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        alert('Error deleting customer');
      }
    }
  };

  if (loading) return <div className="page-state">Loading...</div>;

  return (
    <section className="customers">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">Track progress, assignments, and engagement status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
          Add Customer
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="filters">
        <div className="field compact">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        {role !== 'Team Member' && (
          <div className="field compact">
            <span>Assigned to</span>
            <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
              <option value="">All team members</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="btn btn-ghost" onClick={() => {
          setStatusFilter('');
          setAssignedFilter('');
        }}>
          Reset
        </button>
      </div>

      <div className="panel table-panel">
        {customers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Try adjusting filters or add a new customer to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <Link className="table-link" to={`/customers/${customer._id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.company || '-'}</td>
                  <td>
                    <span className={getStatusClass(customer.status)}>{customer.status}</span>
                  </td>
                  <td>
                    {customer.assignedTo?.length
                      ? customer.assignedTo.map((member) => member.name || member).join(', ')
                      : 'Unassigned'}
                  </td>
                  <td className="row-actions">
                    <button className="btn btn-ghost" onClick={() => navigate(`/customers/${customer._id}`)}>
                      View
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(`/customers/${customer._id}/edit`)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button className="btn btn-danger" onClick={() => handleDelete(customer._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {role === 'Team Member' && (
        <div className="hint">
          You are viewing customers assigned to you based on your role permissions.
        </div>
      )}
      {role !== 'Team Member' && !assignedFilter && teamMembers.length === 0 && (
        <div className="hint">
          Team member list is empty or unavailable; assignments will stay manual.
        </div>
      )}
    </section>
  );
};

export default CustomerList;

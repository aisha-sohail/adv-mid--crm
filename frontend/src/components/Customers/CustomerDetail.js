import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { getStatusClass } from '../../utils/helpers';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || 'Team Member';
  const canDelete = role === 'Admin' || role === 'CRM Manager';

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    API.get(`/customers/${id}`)
      .then((response) => {
        if (!isMounted) return;
        setCustomer(response.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Unable to load customer.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await API.delete(`/customers/${id}`);
      navigate('/customers');
    } catch (error) {
      setError('Unable to delete customer.');
    }
  };

  if (loading) return <div className="page-state">Loading...</div>;

  if (!customer) {
    return (
      <div className="panel">
        <h3>Customer not found</h3>
        <p className="muted">The record may have been removed.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
          Back to customers
        </button>
      </div>
    );
  }

  return (
    <section className="customer-detail">
      <div className="page-header">
        <div>
          <h1>{customer.name}</h1>
          <p className="page-subtitle">{customer.company || 'No company listed'}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
            Back
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}>
            Edit
          </button>
          {canDelete && (
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="grid two">
        <div className="panel">
          <h3>Profile</h3>
          <div className="detail-list">
            <div>
              <span>Email</span>
              <strong>{customer.email || '-'}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{customer.phone || '-'}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                <span className={getStatusClass(customer.status)}>{customer.status}</span>
              </strong>
            </div>
            <div>
              <span>Created by</span>
              <strong>{customer.createdBy?.name || 'Unknown'}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>Assignments</h3>
          {customer.assignedTo?.length ? (
            <ul className="list">
              {customer.assignedTo.map((member) => (
                <li key={member._id || member}>
                  {member.name || member} {member.email ? `· ${member.email}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No team members assigned.</p>
          )}
        </div>

        <div className="panel wide">
          <h3>Notes</h3>
          <p className="notes">{customer.notes || 'No notes captured yet.'}</p>
        </div>
      </div>
    </section>
  );
};

export default CustomerDetail;

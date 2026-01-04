import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError('');
      const response = await API.get('/customers/stats');
      setStats(response.data);
    } catch (error) {
      setError('Unable to load dashboard metrics.');
    }
  };

  if (!stats && !error) return <div className="page-state">Loading...</div>;

  const distribution = stats?.statusDistribution || [];

  return (
    <section className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Live overview of customer flow and current workload.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStats}>Refresh</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {stats && (
        <div className="grid cards">
          <div className="panel hero">
            <h3>Total Customers</h3>
            <p className="hero-number">{stats.totalCustomers}</p>
            <p className="muted">Active records across the organization.</p>
          </div>

          {distribution.map((item) => {
            const percent = stats.totalCustomers
              ? Math.round((item.count / stats.totalCustomers) * 100)
              : 0;
            return (
              <div key={item._id} className="panel">
                <div className="panel-title">
                  <h4>{item._id}</h4>
                  <span className="pill">{percent}%</span>
                </div>
                <p className="stat-number">{item.count}</p>
                <div className="progress">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Dashboard;

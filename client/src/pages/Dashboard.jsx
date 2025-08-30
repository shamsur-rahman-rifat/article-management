import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../auth/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('admin');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function formatDateWithDiff(current, previous) {
    if (!current) return '—';

    const currentDate = new Date(current);
    const formattedDate = currentDate.toISOString().split('T')[0];

    if (!previous) return formattedDate;

    const previousDate = new Date(previous);
    const diffTime = currentDate - previousDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return `${formattedDate} (${diffDays+1}d)`;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAdmin) return;

      try {
        const res = await api.get('/getDashboardData');
        setData(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">📊 Dashboard</h3>
        <p>Welcome <strong>{user?.email}</strong></p>
        <div><strong>Your roles:</strong> {user?.roles?.join(', ') || 'No roles'}</div>
        <hr />
        <p>Use the menu to navigate.</p>
      </div>
    );
  }

  return (
<div className="container mt-4">
  <h3 className="mb-4 text-center text-primary">📊 Admin Timeline Dashboard</h3>
  <div className="d-flex justify-content-between align-items-center">
    <p className="m-0">Welcome, <strong>{user?.email}</strong></p>
    <div><strong>Your roles:</strong> {user?.roles?.join(', ') || 'No roles'}</div>
  </div>
  <hr />
  
  {loading ? (
    <div className="text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-3">Loading dashboard data...</p>
    </div>
  ) : error ? (
    <div className="alert alert-danger text-center">
      <strong>Error:</strong> {error}
    </div>
  ) : (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle table-striped">
        <thead className="table-light">
          <tr>
            <th>Project</th>
            <th>Month</th>
            <th>Topic</th>
            <th>Topic Given</th>
            <th>Writer Assigned</th>
            <th>Writing Complete</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted">No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.project}</td>
                <td>{item.month}</td>
                <td>{item.topic}</td>
                <td>{formatDate(item.researchSubmittedAt)}</td>
                <td>{formatDateWithDiff(item.adminAssignedAt, item.researchSubmittedAt)}</td>
                <td>{formatDateWithDiff(item.writerSubmittedAt, item.adminAssignedAt)}</td>
                <td>{formatDateWithDiff(item.publishedAt, item.writerSubmittedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )}
</div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../auth/AuthContext';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('admin');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 Format: 12 Aug, 2025
  function formatReadableDate(dateStr) {
    if (!dateStr) return '—';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  }

  // 🔹 Format with difference
  function formatDateWithDiff(current, previous) {
    if (!current) return '—';

    const currentDate = new Date(current);
    const formattedDate = formatReadableDate(current);

    if (!previous) return formattedDate;

    const previousDate = new Date(previous);
    const diffTime = currentDate - previousDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return `${formattedDate} (${diffDays + 1}d)`;
  }

  // 🔹 KPI Calculator
  function getSummaryStats(data) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let topicsThisMonth = 0,
      publishedThisMonth = 0,
      topicsLastMonth = 0,
      publishedLastMonth = 0;

    data.forEach(item => {
      if (item.researchSubmittedAt) {
        const d = new Date(item.researchSubmittedAt);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) topicsThisMonth++;
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) topicsLastMonth++;
      }

      if (item.publishedAt) {
        const d = new Date(item.publishedAt);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) publishedThisMonth++;
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) publishedLastMonth++;
      }
    });

    return { topicsThisMonth, publishedThisMonth, topicsLastMonth, publishedLastMonth };
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

  // 🔹 CSV headers
  const csvHeaders = [
    { label: "Project", key: "project" },
    { label: "Month", key: "month" },
    { label: "Topic", key: "topic" },
    { label: "Topic Given", key: "researchSubmittedAt" },
    { label: "Writer Assigned", key: "adminAssignedAt" },
    { label: "Writing Complete", key: "writerSubmittedAt" },
    { label: "Content Published", key: "publishedAt" }
  ];

  // 🔹 Excel Export
  const exportToExcel = () => {
    const formattedData = data.map(item => ({
      Project: item.project,
      Month: item.month,
      Topic: item.topic,
      "Topic Given": formatReadableDate(item.researchSubmittedAt),
      "Writer Assigned": formatDateWithDiff(item.adminAssignedAt, item.researchSubmittedAt),
      "Writing Complete": formatDateWithDiff(item.writerSubmittedAt, item.adminAssignedAt),
      "Content Published": formatDateWithDiff(item.publishedAt, item.writerSubmittedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard");
    XLSX.writeFile(workbook, "dashboard.xlsx");
  };

  if (!isAdmin) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">📊 Dashboard</h3>
        <div className="text-center">
          <p>Welcome <strong>{user?.email}</strong></p>
          <div>
            <strong>Your roles: </strong>
            {user?.roles?.map((role, i) => (
              <span key={i} className="badge bg-secondary ms-1">{role}</span>
            ))}
          </div>
        </div>
        <hr />
        <p className="text-center text-muted">Use the menu to navigate.</p>
      </div>
    );
  }

  // 🔹 Get summary stats
  const { topicsThisMonth, publishedThisMonth, topicsLastMonth, publishedLastMonth } = getSummaryStats(data);

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h3 className="mb-2 mb-md-0 text-center text-md-start">
          📊 Admin Timeline Dashboard
        </h3>
        <div className="text-center text-md-end">
          <div className="mb-2">
            Welcome, <strong>{user?.email}</strong>
          </div>
          <div>
            {user?.roles?.map((role, i) => (
              <span key={i} className="badge bg-primary me-1">{role}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row text-center mb-4">
        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Topics This Month</h6>
              <h4 className="fw-bold text-primary">{topicsThisMonth}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Published This Month</h6>
              <h4 className="fw-bold text-success">{publishedThisMonth}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Topics Last Month</h6>
              <h4 className="fw-bold text-warning">{topicsLastMonth}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Published Last Month</h6>
              <h4 className="fw-bold text-danger">{publishedLastMonth}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="d-flex flex-wrap gap-2 mb-3 justify-content-center justify-content-md-end">
        <CSVLink
          data={data}
          headers={csvHeaders}
          filename="dashboard.csv"
          className="btn btn-outline-success"
        >
          ⬇️ Export CSV
        </CSVLink>
        <button onClick={exportToExcel} className="btn btn-outline-primary">
          ⬇️ Export Excel
        </button>
      </div>

      <hr />

      {/* Loader / Error / Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center my-5">
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light text-center">
              <tr>
                <th>Project</th>
                <th>Month</th>
                <th>Topic</th>
                <th>Topic Given</th>
                <th>Writer Assigned</th>
                <th>Writing Complete</th>
                <th>Content Published</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.project}</td>
                    <td>{item.month}</td>
                    <td className="text-start">{item.topic}</td>
                    <td>{formatReadableDate(item.researchSubmittedAt)}</td>
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

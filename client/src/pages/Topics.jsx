import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../auth/AuthContext';
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

export default function Topics() {
  const { user } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [writers, setWriters] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedWriters, setSelectedWriters] = useState({});
  const [editingTopicId, setEditingTopicId] = useState(null);

  const initialForm = {
    title: '',
    keywords: '',
    month: '',
    wordCount: 1000,
    type: 'Blog Post',
    project: '',
    assignedTo: '' 
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, projectsRes, usersRes] = await Promise.all([
          api.get('/viewTopicList'),
          api.get('/viewProjectList'),
          api.get('/viewUserList')
        ]);
        const users = usersRes.data?.data || [];
        setTopics(topicsRes.data?.data || []);
        setProjects(projectsRes.data?.data || []);
        setAllUsers(users);
        setWriters(users.filter(u => u.roles.includes('writer')));
      } catch (err) {
        console.error(err);
        alert('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const getUserNameById = userId =>
    allUsers.find((u) => u._id === userId)?.name || allUsers.find((u) => u._id === userId)?.email || '-';

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { title, keywords, month, wordCount, type, project, assignedTo } = form;
    
    if (!title || !month || !wordCount || !project) return alert('Please fill in all required fields');

    const payload = {
      title,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      month,
      wordCount,
      type,
      project,
      assignedTo: assignedTo || null,
      createdBy: user?.email,
      status: assignedTo ? 'assigned' : 'pending'
    };

    try {
      const response = editingTopicId
        ? await api.put(`/updateTopic/${editingTopicId}`, payload)
        : await api.post('/addTopic', payload);

      alert(`Topic ${editingTopicId ? 'updated' : 'added'} successfully`);

      setForm(initialForm);
      setEditingTopicId(null);
      const refreshed = await api.get('/viewTopicList');
      setTopics(refreshed.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to save topic');
    }
  };

  const handleEdit = (topic) => {
    setEditingTopicId(topic._id);
    setForm({
      title: topic.title,
      keywords: Array.isArray(topic.keywords) ? topic.keywords.join(', ') : topic.keywords,
      month: topic.month,
      wordCount: topic.wordCount,
      type: topic.type || 'Blog Post',
      project: topic.project,
      assignedTo: topic.assignedTo || ''
    });
  };

  const cancelEdit = () => setEditingTopicId(null);

  const deleteTopic = async (id) => {
    if (window.confirm('Delete this topic?')) {
      try {
        await api.delete(`/deleteTopic/${id}`);
        setTopics(prev => prev.filter(t => t._id !== id));
        alert('Topic deleted');
      } catch (err) {
        console.error(err);
        alert('Failed to delete');
      }
    }
  };

  const assignToWriterByEmail = async (topicId, email) => {
    try {
      const { data } = await api.post(`/getUserByEmail/${email}`);
      const writer = data?.data;

      if (!writer?.roles?.includes('writer')) return alert('Not a valid writer');

      await api.put(`/updateTopic/${topicId}`, { status: 'assigned', assignedTo: writer._id });

      setSelectedWriters(prev => ({ ...prev, [topicId]: undefined }));
      const refreshed = await api.get('/viewTopicList');
      setTopics(refreshed.data?.data || []);
      alert(`Assigned to ${writer.email}`);
    } catch (err) {
      console.error(err);
      alert('Failed to assign');
    }
  };

  const ProjectName = ({ id }) => <>{projects.find(p => p._id === id)?.name || 'N/A'}</>;

  const exportToExcel = () => {
    const exportData = topics.map(t => ({
      Title: t.title,
      Month: t.month,
      Project: projects.find(p => p._id === t.project)?.name || "N/A",
      Type: t.type,
      Status: t.status,
      Writer: getUserNameById(t.assignedTo)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Topics");
    XLSX.writeFile(workbook, "topics.xlsx");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">📚 Topics Dashboard</h3>

      {/* Add/Edit Topic Form */}
      {(user?.roles?.includes('researcher') || user?.roles?.includes('admin')) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editingTopicId ? '✏️ Edit Topic' : '➕ Add New Topic'}</h5>
            <form onSubmit={handleFormSubmit}>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {['title', 'month', 'wordCount', 'type', 'project'].map((field, idx) => (
                  <div key={idx} className="col">
                    {field === 'month' ? (
                      <select className="form-select" value={form[field]} onChange={e => handleFormChange(field, e.target.value)} required>
                        <option value="">Select Month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : field === 'project' ? (
                      <select className="form-select" value={form[field]} onChange={e => handleFormChange(field, e.target.value)} required>
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    ) : (
                      <input className="form-control" type={field === 'wordCount' ? 'number' : 'text'} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={form[field]} onChange={e => handleFormChange(field, e.target.value)} required />
                    )}
                  </div>
                ))}

                {/* Writer Selection (Only for Admin when editing) */}
                {editingTopicId && user?.roles?.includes('admin') && (
                  <div className="col">
                    <select className="form-select" value={form.assignedTo} onChange={e => handleFormChange('assignedTo', e.target.value)}>
                      <option value="">No Writer Assigned</option>
                      {writers.map(w => <option key={w._id} value={w._id}>{w.name || w.email}</option>)}
                    </select>
                  </div>
                )}

                <div className="col d-flex align-items-end ">
                  {editingTopicId ? (
                    <div className="d-flex gap-2 w-100">
                      <button className="btn btn-success w-100" type="submit">Update</button>
                      <button className="btn btn-secondary w-100" type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <button className="btn btn-primary w-100" type="submit">Add</button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Topics (Admins) */}
      {user?.roles?.includes('admin') && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">⏳ Pending Topics</h5>
            {topics.filter(t => t.status === 'pending').length === 0 ? (
              <p className="text-muted">No pending topics.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle table-striped">
                  <thead className="table-light text-center">
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Month</th>
                      <th>Type</th>                    
                      <th>Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.filter(t => t.status === 'pending').map(t => (
                      <tr key={t._id}>
                        <td>{t.title}</td>
                        <td><ProjectName id={t.project} /></td>
                        <td>{t.month}</td>
                        <td>{t.type}</td>                      
                        <td>
                          <div className="d-flex gap-2">
                            <select className="form-select form-select-sm" value={selectedWriters[t._id] || ''} onChange={e => setSelectedWriters(prev => ({ ...prev, [t._id]: e.target.value }))}>
                              <option value="">Select Writer</option>
                              {writers.map(w => <option key={w._id} value={w.email}>{w.name || w.email}</option>)}
                            </select>
                            <button className="btn btn-sm btn-success" onClick={() => assignToWriterByEmail(t._id, selectedWriters[t._id])} disabled={!selectedWriters[t._id]}>
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Topics Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">📋 All Topics</h5>
            <div className="d-flex gap-2">
              <CSVLink data={topics.map(t => ({ Title: t.title, Month: t.month, Project: projects.find(p => p._id === t.project)?.name || "N/A", Type: t.type, Status: t.status, Writer: getUserNameById(t.assignedTo) }))} filename="topics.csv" className="btn btn-sm btn-outline-success">⬇️ CSV</CSVLink>
              <button onClick={exportToExcel} className="btn btn-sm btn-outline-primary">⬇️ Excel</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle table-striped">
              <thead className="table-light text-center">
                <tr>
                  <th>Title</th>
                  <th>Month</th>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Writer</th>
                  {(user?.roles?.includes('researcher') || user?.roles?.includes('admin')) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {topics.map(t => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>{t.month}</td>
                    <td><ProjectName id={t.project} /></td>
                    <td>{t.type}</td>
                    <td>
                      <span className={`badge bg-${t.status === 'assigned' ? 'info' : 'secondary'}`}>{t.status || 'draft'}</span>
                    </td>
                    <td>{getUserNameById(t.assignedTo)}</td>
                    {(user?.roles?.includes('admin') || (user?.roles?.includes('researcher') && !t.assignedTo)) && (
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(t)}>✏️ Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTopic(t._id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
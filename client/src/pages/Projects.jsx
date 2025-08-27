import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/viewProjectList');
      setProjects(res.data?.data || []);
    } catch (err) {
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const action = editingId
        ? api.put(`/updateProject/${editingId}`, form)
        : api.post('/addProject', form);
      await action;
      alert(editingId ? 'Project updated!' : 'Project added!');
      setForm({ name: '' });
      setEditingId(null);
      fetchProjects();
    } catch {
      alert(editingId ? 'Update failed' : 'Add failed');
    }
  };

  const handleEdit = ({ _id, id, name, word}) => {
    setEditingId(_id || id);
    setForm({ name, word });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/deleteProject/${id}`);
      alert('Project deleted!');
      fetchProjects();
    } catch {
      alert('Delete failed');
    }
  };

return (
  <div className="container py-4">
          <h3 className="mb-4 text-center">🗂️ Project Dashboard</h3>
    {/* Project Form */}
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-4">{editingId ? '✏️ Edit Project' : '➕ Add New Project'}</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <label htmlFor="projectName" className="form-label">Project Name</label>
              <input
                type="text"
                id="projectName"
                className="form-control"
                placeholder="Enter project name"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <label htmlFor="words" className="form-label">Words (Per Month)</label>
              <input
                type="number"
                id="words"
                className="form-control"
                placeholder="e.g., 5000"
                min={0}
                value={form.word}
                onChange={e => handleChange('word', Number(e.target.value))}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 d-flex align-items-end gap-2">
              <button className="btn btn-primary w-100" type="submit">
                {editingId ? 'Update Project' : 'Add Project'}
              </button>
              {editingId && (
                <button
                  className="btn btn-outline-secondary w-100"
                  type="button"
                  onClick={() => {
                    setForm({ name: '', word: 0 });
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>

    {/* Projects Table */}
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">🗂️ Projects List</h5>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p>No projects found.</p>
            <p>Start by adding a new project above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th scope="col">Project Name</th>
                  <th scope="col">Words (Monthly)</th>
                  <th scope="col" style={{ minWidth: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const id = p._id || p.id;
                  return (
                    <tr key={id}>
                      <td className="text-start">{p.name}</td>
                      <td>{p.word || 0}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            onClick={() => handleEdit(p)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);
}

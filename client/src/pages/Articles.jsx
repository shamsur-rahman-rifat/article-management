import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../auth/AuthContext";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";


export default function Articles() {
  const { user } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit states grouped
  const [editMode, setEditMode] = useState({});
  const [editLinks, setEditLinks] = useState({});

  const isAdmin = user?.roles.includes("admin");
  const isWriter = user?.roles.includes("writer");
  const isPublisher = user?.roles.includes("publisher");

  useEffect(() => {
    fetchArticles();
    fetchUsers();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/viewArticleList");
      setArticles(res.data?.data ?? []);
    } catch {
      alert("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/viewUserList");
      setAllUsers(res.data?.data ?? []);
    } catch {
      alert("Failed to fetch users");
    }
  };

  const getUserName = (idOrEmail) => {
    const found = allUsers.find((u) => u._id === idOrEmail || u.email === idOrEmail);
    return found?.name || found?.email || "—";
  };

  const filteredArticles = () => {
    if (isAdmin || isPublisher) return articles;
    if (isWriter) return articles.filter((a) => a.writer === user.id);
    return [];
  };

  const handleEditClick = (id) => {
    const article = articles.find((a) => a._id === id);
    setEditMode((prev) => ({ ...prev, [id]: true }));
    setEditLinks((prev) => ({
      ...prev,
      [id]: {
        contentLink: article?.contentLink ?? "",
        publishLink: article?.publishLink ?? "",
      },
    }));
  };

  const handleCancelClick = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
  };

  const handleLinkChange = (id, type, value) => {

      let sanitizedValue = value.trim();
      // Add https:// if missing and it's a non-empty value
      if (
        sanitizedValue &&
        !sanitizedValue.startsWith("http://") &&
        !sanitizedValue.startsWith("https://")
      ) {
        sanitizedValue = `https://${sanitizedValue}`;
      }

    setEditLinks((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: sanitizedValue },
    }));
  };

  const handleSaveClick = async (id) => {
    const article = articles.find((a) => a._id === id);
    const { contentLink, publishLink } = editLinks[id] || {};

    const updates = {};
    if ((isWriter || isAdmin) && contentLink) {
      updates.contentLink = contentLink;
      updates.status = "submitted";
    }
    if ((isPublisher || isAdmin) && publishLink) {
      updates.publishLink = publishLink;
      updates.status = "published";
      updates.publisher = article.publisher || user.id;
    }

    if (!updates.contentLink && !updates.publishLink) {
      return alert("Please provide required links");
    }

    try {
      await api.put(`/updateArticle/${id}`, updates);
      setEditMode((prev) => ({ ...prev, [id]: false }));
      fetchArticles();
    } catch {
      alert("Failed to save changes");
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/deleteArticle/${id}`);
      fetchArticles();
    } catch {
      alert("Failed to delete article");
    }
  };

  const handleExcelDownload = () => {
  // Map your article data to a plain array of objects
  const exportData = filteredArticles().map(a => ({
    Title: a.topic?.title ?? "—",
    Project: a.project?.name ?? "—",
    Month: a.topic?.month ?? "—",
    Type: a.topic?.type ?? "—",
    Status: a.status ?? "—",
    Writer: getUserName(a.writer),
    Publisher: a.publisher ? getUserName(a.publisher) : "—",
    "Content Link": a.contentLink ?? "—",
    "Publish Link": a.publishLink ?? "—",
    Date: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "—"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Articles");
  XLSX.writeFile(workbook, "articles.xlsx");
};


return (
  <div className="container py-4">
    <h3 className="mb-4 text-center fw-bold">📝 Articles Dashboard</h3>

    {loading ? (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading articles...</p>
      </div>
    ) : (
      <div className="card shadow-sm border-0">
        {/* Toolbar */}
        <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <CSVLink
              data={filteredArticles().map(a => ({
                Title: a.topic?.title ?? "—",
                Project: a.project?.name ?? "—",
                Month: a.topic?.month ?? "—",
                Type: a.topic?.type ?? "—",
                Status: a.status ?? "—",
                Writer: getUserName(a.writer),
                Publisher: a.publisher ? getUserName(a.publisher) : "—",
                "Content Link": a.contentLink ?? "—",
                "Publish Link": a.publishLink ?? "—",
                Date: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "—"
              }))}
              filename={"articles.csv"}
            >
              <button className="btn btn-sm btn-outline-success">Download CSV</button>
            </CSVLink>

            <button className="btn btn-sm btn-outline-primary" onClick={handleExcelDownload}>
              Download Excel
            </button>
          </div>

          {/* Optional: Add search or filter here later */}
          <div className="text-muted small">Total Articles: {filteredArticles().length}</div>
        </div>

        {/* Table */}
        <div className="table-responsive-md">
          <table className="table table-bordered table-hover table-striped align-middle mb-0">
            <thead className="table-light text-center position-sticky align-middle top-0" style={{ zIndex: 1 }}>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Month</th>
                <th>Type</th>
                <th>Status</th>
                <th>Writer</th>
                <th>Publisher</th>
                <th>Content Link</th>
                <th>Publish Link</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles().map((a) => {
                const isEditing = editMode[a._id];
                const canEditContent = (isWriter && a.writer === user.id) || isAdmin;
                const canEditPublish = (isPublisher && (!a.publisher || a.publisher === user.id)) || isAdmin;

                const contentLinkVal = editLinks[a._id]?.contentLink ?? "";
                const publishLinkVal = editLinks[a._id]?.publishLink ?? "";

                const getStatusBadge = (status) => {
                  switch (status) {
                    case "published":
                      return "success";
                    case "submitted":
                      return "info";
                    default:
                      return "secondary";
                  }
                };

                return (
                  <tr key={a._id} className="align-middle text-center">
                    <td className="text-start">{a.topic?.title ?? "—"}</td>
                    <td>{a.project?.name ?? "—"}</td>
                    <td>{a.topic?.month ?? "—"}</td>
                    <td>{a.topic?.type ?? "—"}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadge(a.status)} px-2 py-1`}>
                        {a.status ?? "draft"}
                      </span>
                    </td>
                    <td>{getUserName(a.writer)}</td>
                    <td>{a.publisher ? getUserName(a.publisher) : "—"}</td>

                    {/* Content Link */}
                    <td>
                      {isEditing && canEditContent ? (
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="Enter content link"
                          value={contentLinkVal}
                          onChange={(e) => handleLinkChange(a._id, "contentLink", e.target.value)}
                        />
                      ) : a.contentLink ? (
                        <a href={a.contentLink} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Publish Link */}
                    <td>
                      {isEditing && canEditPublish ? (
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="Enter publish link"
                          value={publishLinkVal}
                          onChange={(e) => handleLinkChange(a._id, "publishLink", e.target.value)}
                        />
                      ) : a.publishLink ? (
                        <a href={a.publishLink} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "—"}</td>

                    {/* Actions */}
                    <td className="text-nowrap">
                      {isEditing ? (
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleSaveClick(a._id)}
                            disabled={
                              (canEditContent && !contentLinkVal) ||
                              (canEditPublish && !publishLinkVal)
                            }
                            title="Save changes"
                          >
                            💾
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCancelClick(a._id)}
                            title="Cancel editing"
                          >
                            ✖
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1 justify-content-center">
                          {(canEditContent || canEditPublish) && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditClick(a._id)}
                              title="Edit article"
                            >
                              ✏ Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(a._id)}
                              title="Delete article"
                            >
                              🗑 Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
}

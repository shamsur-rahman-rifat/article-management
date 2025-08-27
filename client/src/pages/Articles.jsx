import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../auth/AuthContext";

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

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">📝 Articles Dashboard</h3>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading articles...</p>
        </div>
      ) : (
        <div className="table-responsive-md">
          <table className="table table-bordered table-hover align-middle table-striped">
            <thead className="table-light align-middle text-center">
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

                return (
                  <tr key={a._id}>
                    <td>{a.topic?.title ?? "—"}</td>
                    <td>{a.project?.name ?? "—"}</td>
                    <td>{a.topic?.month ?? "—"}</td>
                    <td>{a.topic?.type ?? "—"}</td>
                    <td className="text-center">
                      <span
                        className={`badge bg-${
                          a.status === "published"
                            ? "success"
                            : a.status === "submitted"
                            ? "info"
                            : "secondary"
                        }`}
                      >
                        {a.status}
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
                        <a href={a.contentLink} target="_blank" rel="noreferrer" title={a.contentLink}>
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
                        <a href={a.publishLink} target="_blank" rel="noreferrer" title={a.publishLink}>
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Date */}
                    <td>
                      {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "—"}
                    </td>                    

                    {/* Actions */}
                    <td className="text-nowrap">
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
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
                        </>
                      ) : (
                        <>
                          {(canEditContent || canEditPublish) && (
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
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
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

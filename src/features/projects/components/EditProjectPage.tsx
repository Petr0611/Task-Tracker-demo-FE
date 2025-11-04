import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { getUserRole } from "../../../lib/api/projectApi";
import AccessDenied from "./AccessDenied";

import "../../../css/Project.css";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

function EditProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getUserRole(projectId!);
        setRole(userRole);
        if (userRole === "MEMBER" || userRole === "VIEWER") {
          setAccessDenied(true);
        }
      } catch {
        console.error("Failed to fetch user role");
        setAccessDenied(true);
      } finally {
        setCheckingAccess(false);
      }
    };
    fetchRole();
  }, [projectId]);

  useEffect(() => {
    if (!role || accessDenied) return;
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/v1/projects/${projectId}`);
        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
      } catch {
        setError("Failed to load project data. Please try again later.");
      }
    };
    fetchProject();
  }, [projectId, role, accessDenied]);

  if (checkingAccess) {
    return (
      <p className="project-backdrop-message">Checking access permissions...</p>
    );
  }

  if (accessDenied) return <AccessDenied />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      await axios.put(`/api/v1/projects/${projectId}`, {
        title,
        description,
      });

      setSuccess(true);
      setTimeout(() => navigate("/projects"), 2000);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to update the project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-panel project-panel--narrow">
      <div className="project-panel__heading">
        <h2 className="project-panel__title">Edit project</h2>
        <p className="project-panel__subtitle">
          Update the project name and description to keep your team aligned.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="project-field">
          <label className="project-field__label" htmlFor="edit-title">
            Project title
          </label>
          <div className="project-field__control">
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="project-field__input"
            />
          </div>
        </div>

        <div className="project-field">
          <label className="project-field__label" htmlFor="edit-description">
            Description
          </label>
          <div className="project-field__control">
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="project-field__textarea"
            />
          </div>
        </div>

        {!success && (
          <div className="project-actions">
            <button
              type="submit"
              disabled={loading}
              className="project-button project-button--primary"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="project-button project-button--ghost"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}

        {success && (
          <p className="project-feedback project-feedback--success">
            Changes saved ✅
          </p>
        )}
        {error && (
          <p className="project-feedback project-feedback--error">{error}</p>
        )}
      </form>

      {success && (
        <div className="project-actions">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="project-button project-button--secondary"
          >
            Back to projects
          </button>
        </div>
      )}
    </div>
  );
}

export default EditProjectPage;

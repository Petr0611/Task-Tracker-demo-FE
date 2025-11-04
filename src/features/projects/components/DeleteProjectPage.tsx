import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import "../../../css/Project.css";

function DeleteProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.delete(`/api/v1/projects/${projectId}`);
      setSuccess(true);
      setTimeout(() => navigate("/projects"), 2000);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message || "Failed to delete the project"
      );
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="project-panel project-panel--narrow">
      <div className="project-panel__heading">
        <h2 className="project-panel__title">Delete Project</h2>
        <p className="project-panel__subtitle">
          This action cannot be undone. The project and all related data will be
          permanently removed.
        </p>
      </div>

      {!success ? (
        <div className="project-confirm">
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="project-button project-button--danger"
            >
              Delete Project
            </button>
          ) : (
            <>
              <p className="project-confirm__prompt">
                Are you sure you want to delete this project?
              </p>
              <div className="project-confirm__actions">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="project-button project-button--danger"
                >
                  {loading ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="project-button project-button--ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          <div className="project-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="project-button project-button--secondary"
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <p className="project-feedback project-feedback--success">
          Project deleted successfully ✅
        </p>
      )}

      {error && (
        <p className="project-feedback project-feedback--error">{error}</p>
      )}
    </div>
  );
}

export default DeleteProjectPage;

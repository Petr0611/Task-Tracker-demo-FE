import { useParams } from "react-router-dom";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import "../../../css/Project.css";

function InviteFormPage() {
  const { projectId } = useParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      await axios.post(`/api/v1/projects/${projectId}/invitations`, {
        email,
        role,
      });
      setSuccess(true);
      setEmail("");
      setRole("MEMBER");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Failed to send the invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-panel project-panel--narrow">
      <div className="project-panel__heading">
        <h2 className="project-panel__title">Invite a collaborator</h2>
        <p className="project-panel__subtitle">
          Send an invitation to add a new teammate to this project.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="project-field">
          <label className="project-field__label" htmlFor="invite-email">
            Email
          </label>
           <div className="project-field__control">
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="project-field__input"
              placeholder="user@example.com"
            />
          </div>
        </div>

        <div className="project-field">
          <label className="project-field__label" htmlFor="invite-role">
            Role
          </label>
          <div className="project-field__control">
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="project-field__select"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="VIEWER">VIEWER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OWNER">OWNER</option>
            </select>
          </div>
        </div>

        <div className="project-actions">
          <button
            type="submit"
            disabled={loading}
            className="project-button project-button--primary"
          >
            {loading ? "Sending..." : "Send invite"}
          </button>
        </div>

        {success && (
          <p className="project-feedback project-feedback--success">
            Invite sent successfully ✅
          </p>
        )}
        {error && (
          <p className="project-feedback project-feedback--error">{error}</p>
        )}
      </form>
    </div>
  );
}

export default InviteFormPage;

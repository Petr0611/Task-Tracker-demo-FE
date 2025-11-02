import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/Auth.css";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/reset-password-request", { email });
      setStatus("success");
    } catch (error) {
      console.error("Password reset failed:", error);
      setStatus("error");
    }
  };

  return (
    <main className="auth-page" aria-labelledby="forgot-password-title">
      <section className="auth-wrapper">

        <button
          type="button"
          className="auth-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      <header className="auth-header">
          <span className="auth-label">Password reset</span>
          <h1 id="forgot-password-title" className="auth-title">
            Forgot your password?
          </h1>
          <p className="auth-subtitle">
            Enter the email you use for ToDoBeDo and we’ll send a secure link to set a new password.
          </p>
        </header>

        {status === "success" && (
          <div className="auth-status auth-status--success" role="status">
            Link sent! Please check your inbox.
          </div>
        )}

        {status === "error" && (
          <div className="auth-status auth-status--error" role="alert">
            Failed to send the reset email. Please double-check the address and try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-field__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" className="auth-submit">
            Send reset link
          </button>
        </form>

        <p className="auth-footer">
          Remembered your password? <Link className="auth-link" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPasswordForm;

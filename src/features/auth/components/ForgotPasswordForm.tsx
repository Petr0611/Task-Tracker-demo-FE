import axios from "axios";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/reset-password-request", { email });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-sm mt-10 p-6 bg-white border rounded-lg shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Forgot Password</h2>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a password reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send Reset Link
        </button>
      </form>

      {status === "success" && (
        <div className="text-sm text-green-600 text-center">
          Link sent! Please check your email.
        </div>
      )}
      {status === "error" && (
        <div className="text-sm text-red-600 text-center">
          Failed to send. Please check your email address.
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;

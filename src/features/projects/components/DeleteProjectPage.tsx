import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios, { AxiosError } from "axios";

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
        axiosError.response?.data?.message || "Ошибка при удалении проекта"
      );
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Delete Project
      </h2>
      <p className="text-gray-600 mb-6">
        This action cannot be undone. The project and all related data will be
        permanently deleted.
      </p>

      {!success && (
        <>
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Delete Project
            </button>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-gray-700 font-medium">
                Are you sure you want to delete this project?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Back
          </button>
        </>
      )}

      {success && (
        <p className="text-green-600 text-sm mt-4 font-medium animate-fadeIn">
          Project deleted successfully ✅
        </p>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );
}

export default DeleteProjectPage;

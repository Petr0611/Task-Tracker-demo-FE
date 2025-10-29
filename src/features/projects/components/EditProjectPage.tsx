import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

function EditProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/v1/projects/${projectId}`);
        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
      } catch (e) {
        setError("Не удалось загрузить данные проекта");
      }
    };
    fetchProject();
  }, [projectId]);

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
        axiosError.response?.data?.message || "Ошибка при обновлении проекта"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Редактировать проект
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название проекта:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!success && (
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        )}

        {success && (
          <p className="text-green-600 text-sm mt-2 font-medium animate-fadeIn">
            Изменения сохранены ✅
          </p>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {!success && (
        <button
          onClick={() => navigate(-1)}
          className="mt-4 w-full py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
        >
          Отмена
        </button>
      )}
    </div>
  );
}

export default EditProjectPage;

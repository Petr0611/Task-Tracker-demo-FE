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
        Удалить проект
      </h2>
      <p className="text-gray-600 mb-6">
        Это действие нельзя отменить. Проект и все связанные данные будут
        удалены безвозвратно.
      </p>

      {!success && (
        <>
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Удалить проект
            </button>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-gray-700 font-medium">
                Вы уверены, что хотите удалить этот проект?
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
                  {loading ? "Удаление..." : "Да, удалить"}
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Назад
          </button>
        </>
      )}

      {success && (
        <p className="text-green-600 text-sm mt-4 font-medium animate-fadeIn">
          Проект успешно удалён ✅
        </p>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );
}

export default DeleteProjectPage;

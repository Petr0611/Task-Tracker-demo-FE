import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { AxiosError } from "axios";

const ConfirmInvitePage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!inviteToken) {
      setMessage("Токен приглашения отсутствует");
      setStatus("error");
      return;
    }

    const confirmInvite = async () => {
      try {
        const response = await axiosInstance.post("invitations/accept", null, {
          params: { inviteToken },
        });

        const projectId = response.data.projectId;
        const projectTitle = response.data.projectTitle;
        const role = response.data.role || "участник";

        setMessage(`Вы добавлены в проект "${projectTitle}" как ${role}`);
        setStatus("success");

        setTimeout(() => navigate(`/projects/${projectId}`), 10000);
      } catch (err: unknown) {
        const fallback = "Ссылка недействительна или уже использована";
        const axiosErr = err as AxiosError<{ message?: string }>;
        const backendMessage = axiosErr.response?.data?.message;
        setMessage(backendMessage || fallback);
        setStatus("error");
      }
    };

    confirmInvite();
  }, [inviteToken, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-20 text-center px-4">
      {status === "loading" && (
        <p className="text-gray-600 text-lg">⏳ Подтверждение приглашения...</p>
      )}
      {status === "success" && (
        <p className="text-green-700 text-lg">
          ✅{" "}
          {message ||
            "Приглашение успешно подтверждено! Перенаправляем в проект..."}
        </p>
      )}
      {status === "error" && (
        <div>
          <p className="text-red-600 text-lg mb-4">❌ {message}</p>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Перейти к проектам
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmInvitePage;

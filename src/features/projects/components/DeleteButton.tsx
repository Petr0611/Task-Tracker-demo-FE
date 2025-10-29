import { useNavigate } from "react-router-dom";

interface DeleteProjectButtonProps {
  projectId: string;
}

const DeleteProjectButton: React.FC<DeleteProjectButtonProps> = ({
  projectId,
}) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить проект?")) {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          alert("Проект успешно удалён");
          navigate("/projects");
        } else {
          const error = await response.json();
          alert(`Ошибка: ${error.message || "Не удалось удалить проект"}`);
        }
      } catch (error) {
        console.error("Ошибка при удалении проекта:", error);
        alert("Произошла ошибка при удалении проекта");
      }
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition"
      >
        Удалить проект
      </button>
    </div>
  );
};

export default DeleteProjectButton;

import { useNavigate } from "react-router-dom";

interface EditProjectButtonProps {
  projectId: string;
}

export default function EditProjectButton({
  projectId,
}: EditProjectButtonProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/projects/${projectId}/edit`);
  };

  return (
    <button
      onClick={handleEdit}
      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition"
    >
      Редактировать проект
    </button>
  );
}

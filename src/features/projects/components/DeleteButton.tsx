import { useNavigate } from "react-router-dom";

interface DeleteProjectButtonProps {
  projectId: string;
}

export default function DeleteProjectButton({
  projectId,
}: DeleteProjectButtonProps) {
  const navigate = useNavigate();

  const handleDelete = () => {
    navigate(`/projects/${projectId}/delete`);
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
    >
      Delete Project
    </button>
  );
}

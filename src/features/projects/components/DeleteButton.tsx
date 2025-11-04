import { useNavigate } from "react-router-dom";
import "../../../css/ProjectManagement.css";

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
      type="button"
      onClick={handleDelete}
      className="project-actions__button project-actions__button--danger"
    >
      Delete project
    </button>
  );
}

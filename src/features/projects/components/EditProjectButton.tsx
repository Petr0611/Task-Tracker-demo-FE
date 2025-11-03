import { useNavigate } from "react-router-dom";
import "../../../css/ProjectManagement.css";

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
      type="button"
      onClick={handleEdit}
      className="project-actions__button project-actions__button--neutral"
    >
      Edit project
    </button>
  );
}

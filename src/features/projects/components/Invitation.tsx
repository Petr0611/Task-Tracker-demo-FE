import { useNavigate } from "react-router-dom";
import "../../../css/ProjectManagement.css";

interface InviteButtonProps {
  projectId: string;
}

const InviteButton: React.FC<InviteButtonProps> = ({ projectId }) => {
  const navigate = useNavigate();

  const handleInvite = () => {
    navigate(`/projects/${projectId}/invitations`);
  };

  return (
     <button
      type="button"
      onClick={handleInvite}
      className="project-actions__button project-actions__button--primary"
    >
      Invite
    </button>
  );
};
export default InviteButton;

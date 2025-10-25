import { useNavigate } from "react-router-dom";

// InviteButton.tsx
interface InviteButtonProps {
  projectId: string;
}

interface InviteButtonProps {
  projectId: string;
}

const InviteButton: React.FC<InviteButtonProps> = ({ projectId }) => {
  const navigate = useNavigate();

  const handleInvite = () => {
    navigate(`/projects/${projectId}/invitations`);
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleInvite}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Пригласить
      </button>
    </div>
  );
};
export default InviteButton;

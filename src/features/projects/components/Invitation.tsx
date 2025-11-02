import { useNavigate } from "react-router-dom";

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
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition"
      >
        Invite
      </button>
    </div>
  );
};
export default InviteButton;

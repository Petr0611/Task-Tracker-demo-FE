import InviteButton from "../components/Invitation";
import DeleteProjectButton from "./DeleteButton";
import EditProjectButton from "./EditProjectButton";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

interface ProjectActionsProps {
  role: Role;
  projectId: string;
}

export default function ProjectActions({
  role,
  projectId,
}: ProjectActionsProps) {
  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  const isMember = role === "MEMBER";
  const isViewer = role === "VIEWER";
  const canManage = isOwner || isAdmin;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm space-y-3 transition-opacity duration-500 animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-800">
        Управление проектом
      </h2>

      {isOwner && <DeleteProjectButton projectId={projectId} />}

      {canManage && (
        <div className="flex flex-wrap gap-3">
          <InviteButton projectId={projectId} />
          <EditProjectButton projectId={projectId} />
        </div>
      )}

      {(isMember || isViewer) && (
        <p className="text-gray-600 italic">
          У вас права только на просмотр проекта.
        </p>
      )}
    </div>
  );
}

import InviteButton from "../components/Invitation";
import DeleteProjectButton from "./DeleteButton";
import EditProjectButton from "./EditProjectButton";
import "../../../css/ProjectManagement.css";

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
    <div className="project-actions">
      <h2 className="project-actions__title">Project management</h2>

       {isOwner && (
        <div className="project-actions__section">
          <DeleteProjectButton projectId={projectId} />
        </div>
      )}

      {canManage && (
        <div className="project-actions__buttons">
          <InviteButton projectId={projectId} />
          <EditProjectButton projectId={projectId} />
        </div>
      )}

      {(isMember || isViewer) && (
        <p className="project-actions__note">
          You only have view permissions for this project.
        </p>
      )}
    </div>
  );
}

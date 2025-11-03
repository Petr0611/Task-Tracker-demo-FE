import "../../../css/ProjectManagement.css";
export default function AccessDenied() {
  return (
    <div className="project-access-denied">
      <h3 className="project-access-denied__title">❌ Access denied</h3>
      <p className="project-access-denied__text">
        You don’t have permission to perform this action. Please contact the
        project owner if you need access.
      </p>
    </div>
  );
}

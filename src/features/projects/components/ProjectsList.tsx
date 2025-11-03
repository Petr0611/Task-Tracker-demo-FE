import "../../../css/Project.css";
import type { Project } from "../types";
interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}
export default function ProjectsList({
  projects = [],
  onProjectClick,
}: ProjectsListProps) {
  if (projects.length === 0) return null;
  const UsersIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="project-card__icon"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
  const MailIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="project-card__icon project-card__icon--mail"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
    </svg>
  );

  return (
    <section className="project-section">
      <div className="project-section__header">
        <h2 className="project-section__title">Your projects</h2>
        <span className="project-section__count">({projects.length})</span>
      </div>

      <div className="project-section__items">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <button
              type="button"
              className="project-card__button"
              onClick={() => onProjectClick?.(project)}
            >
              <header>
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__description">{project.description}</p>
              </header>

                   <div className="project-card__meta">
                {project.members && project.members.length > 0 && (
                  <div className="project-card__group">
                    <span className="project-card__label">
                      {UsersIcon}
                     Members
                    </span>

                      {project.members.map((member) => (
                      <span
                        key={member.id}
                        className="project-chip project-chip--member"
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="project-chip__avatar"
                          />
                        ) : (
                          <span className="project-chip__placeholder">
                            {member.name
                              .toUpperCase()
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                         )}
                        {member.name} ({member.role})
                      </span>
                    ))}
                  </div>
                )}

                 {project.invitations && project.invitations.length > 0 && (
                  <div className="project-card__group">
                    <span className="project-card__label">
                      {MailIcon}
                       Invitations
                    </span>

                      {project.invitations.map((invitation, index) => (
                      <span
                        key={`${project.id}-inv-${index}`}
                        className="project-chip project-chip--invitation"
                        title={`Status: ${invitation.collaboratorStatus}`}
                      >
                        {invitation.email} — {invitation.role} — {invitation.collaboratorStatus}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

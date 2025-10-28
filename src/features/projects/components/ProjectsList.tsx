import type { Project } from "../types";

interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectsList({
  projects,
  onProjectClick,
}: ProjectsListProps) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Ваши проекты</h2>

      <div className="flex flex-col gap-3">
        {projects.map((project) => {
          console.log("Project members:", project.members);
          console.log("Project invitations:", project.invitations);

          return (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition"
            >
              <button
                type="button"
                onClick={() => onProjectClick?.(project)}
                className="flex-1 text-left focus:outline-none"
              >
                <span className="text-base font-medium text-gray-900">
                  {project.title}
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  {project.description}
                </span>

                {/* Члены проекта */}
                {project.members && project.members.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                    {project.members.map((member) => (
                      <span
                        key={member.id}
                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1"
                      >
                        {member.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({member.role})
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Приглашённые */}
                {project.invitations && project.invitations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-blue-600">
                    {project.invitations.map((inv, index) => (
                      <span
                        key={project.id + index}
                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1"
                      >
                        {inv.role} — {inv.collaboratorStatus}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {/* <div className="ml-4 flex-shrink-0">
                <InviteButton projectId={project.id} />
              </div> */}
            </div>
          );
        })}
      </div>
    </section>
  );
}

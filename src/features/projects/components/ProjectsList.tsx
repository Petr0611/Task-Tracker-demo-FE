import { useNavigate } from "react-router-dom";
import type { Project } from "../types";

interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectsList({
  projects = [],
  onProjectClick,
}: ProjectsListProps) {
  const navigate = useNavigate();

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
      className="w-5 h-5 text-gray-500"
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
      className="w-5 h-5 text-orange-500"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
    </svg>
  );

  return (
    <section className="space-y-6 p-6 bg-gray-50 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">
        Your projects{" "}
        <span className="text-indigo-600">({projects.length})</span>
      </h2>

      <div className="flex flex-col gap-5">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group"
          >
            <button
              type="button"
              onClick={() => onProjectClick?.(project)}
              className="block w-full text-left p-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-opacity-50 rounded-2xl transition-colors duration-150"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </span>
                <span className="text-sm text-gray-600">
                  {project.description}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                {project.members && project.members.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {UsersIcon}
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Members:
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {project.members.map((member) => (
                        <button
                          key={member.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${member.id}`);
                          }}
                          className="inline-flex items-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 px-3 py-1 shadow-sm border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          title={`Open profile of ${member.name}`}
                        >
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-5 h-5 rounded-full object-cover mr-2"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white mr-2">
                              {member.name
                                .toUpperCase()
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                          )}
                          {member.name} ({member.role})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {project.invitations && project.invitations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    {MailIcon}
                    <span className="text-sm font-medium text-orange-700 whitespace-nowrap">
                      Invitations:
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {project.invitations.map((inv, index) => (
                        <span
                          key={`${project.id}-inv-${index}`}
                          className="inline-flex items-center rounded-full bg-orange-50 text-xs font-medium text-orange-800 px-3 py-1 shadow-sm border border-orange-200 hover:bg-orange-100 transition"
                          title={`Status: ${inv.collaboratorStatus}`}
                        >
                          {inv.email} — {inv.role} — {inv.collaboratorStatus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Project } from "../types";
import InviteButton from "../components/Invitation"; // добавь импорт

interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectsList({
  projects,
  onProjectClick,
}: ProjectsListProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Ваши проекты</h2>

      <div className="flex flex-col gap-3">
        {projects.map((project) => (
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
            </button>

            {/* вот здесь добавляем кнопку приглашения */}
            <div className="ml-4 flex-shrink-0">
              <InviteButton projectId={project.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

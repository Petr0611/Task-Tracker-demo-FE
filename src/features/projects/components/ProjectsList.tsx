import type { Project } from "../types";

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
          <button
            key={project.id}
            type="button"
            onClick={() => onProjectClick?.(project)}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <span className="text-base font-medium text-gray-900">{project.title}</span>
            <span className="mt-1 text-sm text-gray-500">{project.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
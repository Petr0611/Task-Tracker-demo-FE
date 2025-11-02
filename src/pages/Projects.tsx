import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllProjects,
  selectIsLoading,
  selectProjects,
} from "../features/projects/slice/projectsSlice";
import ProjectForm from "../features/projects/components/ProjectForm";
import ProjectsList from "../features/projects/components/ProjectsList";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const isLoading = useAppSelector(selectIsLoading);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const projectsCount = projects.length;
  const previousCountRef = useRef(projectsCount);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projectsCount === 0) {
      setIsCreating(true);
    }
  }, [projectsCount]);

  useEffect(() => {
    if (
      isCreating &&
      projectsCount > previousCountRef.current &&
      projectsCount !== 0
    ) {
      setIsCreating(false);
    }
    previousCountRef.current = projectsCount;
  }, [isCreating, projectsCount]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      {isLoading && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          Loading your projects...
        </div>
      )}

      {!isLoading && isCreating && (
        <ProjectForm
          showCancelButton={projectsCount > 0}
          onCancel={projectsCount > 0 ? () => setIsCreating(false) : undefined}
        />
      )}

      {!isLoading && !isCreating && projectsCount > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Create new project
          </button>

          <ProjectsList
            projects={projects}
            onProjectClick={(project) =>
              navigate(`/projects/${project.id}/tasks`)
            }
          />
        </>
      )}
    </div>
  );
}
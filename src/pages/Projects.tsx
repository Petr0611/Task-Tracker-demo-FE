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
import "../css/ProjectsPage.css";

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
    <main className="projects-page" aria-labelledby="projects-title">
      <section className="projects-container">
        <header className="projects-header">
          <div className="projects-header__info">
            <span className="projects-header__label">Projects overview</span>
            <h1 id="projects-title" className="projects-header__title">
              Shape every initiative in one place
            </h1>
            <p className="projects-header__subtitle">
              Create workspaces for each product stream, track their progress,
              and jump into detailed task boards whenever you are ready.
            </p>
          </div>

          {!isLoading && !isCreating && projectsCount > 0 && (
            <button
              type="button"
              className="projects-create-button projects-create-button--primary"
              onClick={() => setIsCreating(true)}
            >
              Create new project
            </button>
          )}
        </header>

        {isLoading && (
          <div className="projects-card projects-card--muted" role="status">
            Loading your projects...
          </div>
        )}

       {!isLoading && isCreating && (
          <div className="projects-card projects-card--form">
            <ProjectForm
              showCancelButton={projectsCount > 0}
              onCancel={
                projectsCount > 0 ? () => setIsCreating(false) : undefined
              }
            />
          </div>
        )}

      {!isLoading && !isCreating && projectsCount > 0 && (
          <div className="projects-list-wrapper">
            <ProjectsList
              projects={projects}
              onProjectClick={(project) =>
                navigate(`/projects/${project.id}/tasks`)
              }
            />
          </div>
        )}

          {!isLoading && projectsCount === 0 && !isCreating && (
          <div className="projects-card projects-card--empty">
            <h2 className="projects-empty__title">Start with your first project</h2>
            <p className="projects-empty__subtitle">
              There are no projects yet. Create the first workspace to bring
              your team together.
            </p>
            <button
              type="button"
              className="projects-create-button"
              onClick={() => setIsCreating(true)}
            >
              Create your first project
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
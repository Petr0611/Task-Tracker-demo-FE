import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getAllProjects, selectProjects } from "../slice/projectsSlice";

export default function ProjectsList() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);
  const projects = useAppSelector(selectProjects);
  return (
    <section>
      <h2>List of Projects</h2>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>
            <h3>{project.title}</h3>
            <span>{project.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

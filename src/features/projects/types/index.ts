export interface Project {
  id: string;
  title: string;
  description: string;
}

// дто без id
export type CreateProjectDto = Omit<Project, "id">;

export interface ProjectsSliceState {
  projects: Project[];
  createProjectErrorMessage?: string;
  isLoading: boolean;
}

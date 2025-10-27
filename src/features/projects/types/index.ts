export interface ProjectMember {
  id: string;
  name: string;
  collaboratorStatus: "PENDING" | "ACTIVE";
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
}

export interface ProjectInvitation {
  projectId: string;
  projectTitle: string;
  collaboratorStatus: "PENDING" | "ACTIVE";
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  members: ProjectMember[];
  invitations: ProjectMember[];
}

export type CreateProjectDto = Omit<Project, "id" | "members">;

export interface ProjectsSliceState {
  projects: Project[];
  createProjectErrorMessage?: string;
  isLoading: boolean;
}

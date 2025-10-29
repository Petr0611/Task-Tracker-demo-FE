export interface ProjectMember {
  id: string;
  name: string;
  // **ДОБАВЛЕНО:** Поле для URL аватара, чтобы отображать его в карточке
  avatarUrl?: string;
  // collaboratorStatus: "ACTIVE" | "PENDING";
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
}

export interface ProjectInvitation {
  projectId: string;
  projectTitle: string;
  email: string;
  collaboratorStatus: "PENDING" | "ACTIVE";
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  avatarUrl?: string;
  members: ProjectMember[];
  invitations: ProjectInvitation[];
}

export type CreateProjectDto = Omit<Project, "id" | "members">;

export interface ProjectsSliceState {
  projects: Project[];
  createProjectErrorMessage?: string;
  isLoading: boolean;
}

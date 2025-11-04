export interface ProjectMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
}

export interface ProjectInvitation {
  projectId: string;
  projectTitle: string;
  email: string;
  collaboratorStatus: "PENDING" | "ACTIVE";
  role: "OWNER" | "MEMBER" | "VIEWER" | "ADMIN";
  userId?: string; // добавляем опционально, если приглашённый уже зарегистрирован
  avatarUrl?: string; // если хочешь показывать аватар приглашённого
  name?: string; // если хочешь показывать имя вместо email
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

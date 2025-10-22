export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTaskDto = Omit<Task, "id" | "createdAt" | "updatedAt">;

export type UpdateTaskDto = Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>;

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface TasksSliceState {
  tasksByProject: Record<string, Task[]>;
  isLoading: boolean;
  error?: string;
  isCreating: boolean;
  createTaskError?: string;
  updatingTaskIds: Record<string, boolean>;
  updateTaskError?: string;
  deletingTaskIds: Record<string, boolean>;
  deleteTaskError?: string;
}
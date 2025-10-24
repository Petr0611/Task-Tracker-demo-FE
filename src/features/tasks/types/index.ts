export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MoveTaskDto {
  columnId: string;
  orderIndex: number;
}

export interface CreateTaskDto {
  columnId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface CreateTaskInput {
  columnId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface TasksSliceState {
  tasksByProject: Record<string, Task[]>;
  tasksByColumn: Record<string, Task[]>;
  isLoading: boolean;
  error?: string;
  isCreating: boolean;
  createTaskError?: string;
  updatingTaskIds: Record<string, boolean>;
  updateTaskError?: string;
  deletingTaskIds: Record<string, boolean>;
  deleteTaskError?: string;
  movingTaskIds: Record<string, boolean>;
  moveTaskError?: string;
  columnTasksLoading: Record<string, boolean>;
  columnTasksError: Record<string, string | undefined>;
  columnTasksLoaded: Record<string, boolean>;
  taskDetailsById: Record<string, Task | undefined>;
  taskDetailsLoading: Record<string, boolean>;
  taskDetailsError: Record<string, string | undefined>;
}
export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  executorId?: string;
  executorName?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId?: string;
  authorName?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskCommentDto {
  text: string;
}

export interface UpdateTaskCommentDto {
  text: string;
}

export interface MoveTaskDto {
  columnId: string;
  orderIndex: number;
}

export interface BulkUpdateTaskStatusDto {
  taskIds: string[];
  status: string;
}

export interface BulkMoveTasksDto {
  taskIds: string[];
  targetColumnId: string;
  startOrderIndex: number;
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

export interface ProjectTasksFilters {
  status?: string;
  executorId?: string;
  dueBefore?: string;
  sortBy?: string;
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
  isBulkUpdatingStatus: boolean;
  bulkUpdateStatusError?: string;
  isBulkMovingTasks: boolean;
  bulkMoveTasksError?: string;
  columnTasksLoading: Record<string, boolean>;
  columnTasksError: Record<string, string | undefined>;
  columnTasksLoaded: Record<string, boolean>;
  taskDetailsById: Record<string, Task | undefined>;
  taskDetailsLoading: Record<string, boolean>;
  taskDetailsError: Record<string, string | undefined>;
}

export interface TaskCommentsSliceState {
  commentsByTask: Record<string, TaskComment[]>;
  commentsLoading: Record<string, boolean>;
  commentsLoaded: Record<string, boolean>;
  commentsError: Record<string, string | undefined>;
  commentDetailsById: Record<string, TaskComment | undefined>;
  commentDetailsLoading: Record<string, boolean>;
  commentDetailsError: Record<string, string | undefined>;
  creatingCommentByTask: Record<string, boolean>;
  createCommentErrorByTask: Record<string, string | undefined>;
  updatingCommentIds: Record<string, boolean>;
  updateCommentErrorById: Record<string, string | undefined>;
  deletingCommentIds: Record<string, boolean>;
  deleteCommentErrorById: Record<string, string | undefined>;
}
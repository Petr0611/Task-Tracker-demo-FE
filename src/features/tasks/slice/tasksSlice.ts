import { createAppSlice } from "../../../app/createAppSlice";
import type {
  CreateTaskDto,
  CreateTaskInput,
  Task,
  TasksSliceState,
  UpdateTaskDto,
} from "../types";
import * as api from "../services/api";

const sanitizeOptionalField = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
};

const initialState: TasksSliceState = {
  tasksByProject: {},
  isLoading: false,
  error: undefined,
  isCreating: false,
  createTaskError: undefined,
  updatingTaskIds: {},
  updateTaskError: undefined,
  deletingTaskIds: {},
  deleteTaskError: undefined,
};

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState,
  reducers: (create) => ({
    getTasksByProject: create.asyncThunk(
      async (projectId: string) => {
        const tasks = await api.fetchTasksByProject(projectId);
        return { projectId, tasks };
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.error = undefined;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.tasksByProject[action.payload.projectId] = action.payload.tasks;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
          const projectId = action.meta.arg;
          state.tasksByProject[projectId] = [];
        },
      }
    ),

    createTask: create.asyncThunk(
      async ({
        projectId,
        task,
      }: {
        projectId: string;
        task: CreateTaskInput;
      }) => {
        const payload: CreateTaskDto = {
          projectId,
          title: task.title.trim(),
          description: sanitizeOptionalField(task.description),
          status: sanitizeOptionalField(task.status),
          priority: sanitizeOptionalField(task.priority),
          dueDate: sanitizeOptionalField(task.dueDate),
        };

        const createdTask = await api.createTaskForProject(projectId, payload);
        return createdTask;
      },
      {
        pending: (state) => {
          state.isCreating = true;
          state.createTaskError = undefined;
        },
        fulfilled: (state, action) => {
          state.isCreating = false;
          state.createTaskError = undefined;
          const projectTasks = state.tasksByProject[action.payload.projectId] ?? [];
          state.tasksByProject[action.payload.projectId] = [
            ...projectTasks,
            action.payload,
          ];
        },
        rejected: (state, action) => {
          state.isCreating = false;
          state.createTaskError = action.error.message;
        },
      }
    ),

    updateTask: create.asyncThunk(
      async ({
        projectId,
        taskId,
        updates,
      }: {
        projectId: string;
        taskId: string;
        updates: UpdateTaskDto;
      }) => {
        void projectId;
        const sanitizedUpdates: UpdateTaskDto = {
          ...updates,
          title: updates.title?.trim(),
          description: sanitizeOptionalField(updates.description),
          status: sanitizeOptionalField(updates.status),
          priority: sanitizeOptionalField(updates.priority),
          dueDate: sanitizeOptionalField(updates.dueDate),
        };

        const updatedTask = await api.updateTaskById(taskId, sanitizedUpdates);
        return updatedTask;
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.updatingTaskIds[taskId] = true;
          state.updateTaskError = undefined;
        },
        fulfilled: (state, action) => {
          const taskId = action.payload.id;
          const previousProjectId = action.meta.arg.projectId;
          state.updatingTaskIds[taskId] = false;
          delete state.updatingTaskIds[taskId];
          state.updateTaskError = undefined;

          const previousProjectTasks =
            state.tasksByProject[previousProjectId];
          if (previousProjectTasks) {
            state.tasksByProject[previousProjectId] = previousProjectTasks.filter(
              (task) => task.id !== taskId
            );
          }

          const destinationProjectId = action.payload.projectId;
          const destinationTasks =
            state.tasksByProject[destinationProjectId] ?? [];

          const existingTaskIndex = destinationTasks.findIndex(
            (task) => task.id === taskId
          );

          if (existingTaskIndex >= 0) {
            destinationTasks[existingTaskIndex] = action.payload;
          } else {
            destinationTasks.push(action.payload);
          }

          state.tasksByProject[destinationProjectId] = destinationTasks;
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.updatingTaskIds[taskId] = false;
          delete state.updatingTaskIds[taskId];
          state.updateTaskError = action.error.message;
        },
      }
    ),

    deleteTask: create.asyncThunk(
      async ({
        projectId,
        taskId,
      }: {
        projectId: string;
        taskId: string;
      }) => {
        await api.deleteTaskById(taskId);
        return { projectId, taskId };
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.deletingTaskIds[taskId] = true;
          state.deleteTaskError = undefined;
        },
        fulfilled: (state, action) => {
          const { projectId, taskId } = action.payload;
          state.deletingTaskIds[taskId] = false;
          delete state.deletingTaskIds[taskId];
          state.deleteTaskError = undefined;

          const projectTasks = state.tasksByProject[projectId];
          if (projectTasks) {
            state.tasksByProject[projectId] = projectTasks.filter(
              (task) => task.id !== taskId
            );
          }
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.deletingTaskIds[taskId] = false;
          delete state.deletingTaskIds[taskId];
          state.deleteTaskError = action.error.message;
        },
      }
    ),
  }),
  selectors: {
    selectTasksByProject: (state, projectId: string): Task[] =>
      state.tasksByProject[projectId] ?? [],
    selectIsLoading: (state) => state.isLoading,
    selectError: (state) => state.error,
    selectIsCreating: (state) => state.isCreating,
    selectCreateTaskError: (state) => state.createTaskError,
    selectUpdatingTaskIds: (state) => state.updatingTaskIds,
    selectUpdateTaskError: (state) => state.updateTaskError,
    selectDeletingTaskIds: (state) => state.deletingTaskIds,
    selectDeleteTaskError: (state) => state.deleteTaskError,
  },
});

export const { getTasksByProject, createTask, updateTask, deleteTask } =
  tasksSlice.actions;

export const {
  selectTasksByProject,
  selectIsLoading: selectTasksIsLoading,
  selectError: selectTasksError,
  selectIsCreating: selectIsCreatingTask,
  selectCreateTaskError,
  selectUpdatingTaskIds,
  selectUpdateTaskError,
  selectDeletingTaskIds,
  selectDeleteTaskError,
} = tasksSlice.selectors;
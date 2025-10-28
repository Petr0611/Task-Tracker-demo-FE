import { createAppSlice } from "../../../app/createAppSlice";
import type {
  CreateTaskDto,
  CreateTaskInput,
  MoveTaskDto,
  ProjectTasksFilters,
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
  tasksByColumn: {},
  isLoading: false,
  error: undefined,
  isCreating: false,
  createTaskError: undefined,
  updatingTaskIds: {},
  updateTaskError: undefined,
  deletingTaskIds: {},
  deleteTaskError: undefined,
  movingTaskIds: {},
  moveTaskError: undefined,
  columnTasksLoading: {},
  columnTasksError: {},
  columnTasksLoaded: {},
  taskDetailsById: {},
  taskDetailsLoading: {},
  taskDetailsError: {},
};

const ensureColumnTasks = (
  state: TasksSliceState,
  columnId: string
): Task[] => {
  if (!state.tasksByColumn[columnId]) {
    state.tasksByColumn[columnId] = [];
  }
  return state.tasksByColumn[columnId];
};

const removeTaskFromColumns = (state: TasksSliceState, taskId: string) => {
  for (const [columnId, tasks] of Object.entries(state.tasksByColumn)) {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index >= 0) {
      tasks.splice(index, 1);
      state.tasksByColumn[columnId] = tasks;
      break;
    }
  }
};

const replaceTaskInColumns = (
  state: TasksSliceState,
  updatedTask: Task
) => {
  for (const [columnId, tasks] of Object.entries(state.tasksByColumn)) {
    const index = tasks.findIndex((task) => task.id === updatedTask.id);
    if (index >= 0) {
      tasks[index] = updatedTask;
      state.tasksByColumn[columnId] = tasks;
      state.columnTasksLoaded[columnId] = true;
      state.columnTasksError[columnId] = undefined;
      break;
    }
  }
};

const syncProjectColumnsWithTasks = (
  state: TasksSliceState,
  projectId: string,
  tasks: Task[]
) => {
  const tasksByColumn: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    if (!tasksByColumn[task.columnId]) {
      tasksByColumn[task.columnId] = [];
    }
    tasksByColumn[task.columnId].push(task);
  });

  const columnIdsWithTasks = new Set(Object.keys(tasksByColumn));

  for (const [columnId, columnTasks] of Object.entries(state.tasksByColumn)) {
    const hasProjectTasks = columnTasks.some(
      (task) => task.projectId === projectId
    );

    if (hasProjectTasks && !columnIdsWithTasks.has(columnId)) {
      state.tasksByColumn[columnId] = [];
      state.columnTasksLoaded[columnId] = true;
      state.columnTasksError[columnId] = undefined;
    }
  }

  for (const [columnId, columnTasks] of Object.entries(tasksByColumn)) {
    state.tasksByColumn[columnId] = columnTasks;
    state.columnTasksLoaded[columnId] = true;
    state.columnTasksError[columnId] = undefined;
  }
};

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState,
  reducers: (create) => ({
    getTasksByProject: create.asyncThunk(
      async ({
        projectId,
        filters,
      }: {
        projectId: string;
        filters?: ProjectTasksFilters;
      }) => {
        const tasks = await api.fetchTasksByProject({ projectId, filters });
        return { projectId, tasks };
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.error = undefined;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.error = undefined;
          const { projectId, tasks } = action.payload;
          state.tasksByProject[projectId] = tasks;

          syncProjectColumnsWithTasks(state, projectId, tasks);

          tasks.forEach((task) => {
            state.taskDetailsById[task.id] = task;
            state.taskDetailsError[task.id] = undefined;
          });
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
          const projectId = action.meta.arg.projectId;
          state.tasksByProject[projectId] = [];
          syncProjectColumnsWithTasks(state, projectId, []);
        },
      }
    ),

    getTasksByColumn: create.asyncThunk(
      async ({
        projectId,
        columnId,
      }: {
        projectId: string;
        columnId: string;
      }) => {
        const tasks = await api.fetchTasksByColumn(columnId);
        return { projectId, columnId, tasks };
      },
      {
        pending: (state, action) => {
          const columnId = action.meta.arg.columnId;
          state.columnTasksLoading[columnId] = true;
          state.columnTasksError[columnId] = undefined;
        },
        fulfilled: (state, action) => {
          const { projectId, columnId, tasks } = action.payload;
          state.columnTasksLoading[columnId] = false;
          state.columnTasksError[columnId] = undefined;
          state.columnTasksLoaded[columnId] = true;
          state.tasksByColumn[columnId] = tasks;

          const projectTasks = state.tasksByProject[projectId] ?? [];
          const filtered = projectTasks.filter(
            (task) => task.columnId !== columnId
          );
          state.tasksByProject[projectId] = [...filtered, ...tasks];

          tasks.forEach((task) => {
            state.taskDetailsById[task.id] = task;
            state.taskDetailsError[task.id] = undefined;
          });
        },
        rejected: (state, action) => {
          const columnId = action.meta.arg.columnId;
          state.columnTasksLoading[columnId] = false;
          state.columnTasksLoaded[columnId] = true;
          state.columnTasksError[columnId] = action.error.message;
          state.tasksByColumn[columnId] = [];
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
        const columnId = task.columnId.trim();
        if (!columnId) {
          throw new Error("Не выбрана колонка для задачи");
        }

        const payload: CreateTaskDto = {
          columnId,
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

          const newTask = action.payload;
          const projectTasks = state.tasksByProject[newTask.projectId] ?? [];
          projectTasks.push(newTask);
          state.tasksByProject[newTask.projectId] = projectTasks;

          const columnTasks = ensureColumnTasks(state, newTask.columnId);
          columnTasks.push(newTask);
          state.tasksByColumn[newTask.columnId] = columnTasks;
          state.columnTasksLoaded[newTask.columnId] = true;
          state.columnTasksError[newTask.columnId] = undefined;
          state.taskDetailsById[newTask.id] = newTask;
          state.taskDetailsError[newTask.id] = undefined;
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
          const updatedTask = action.payload;
          const taskId = updatedTask.id;
          const previousProjectId = action.meta.arg.projectId;

          state.updatingTaskIds[taskId] = false;
          delete state.updatingTaskIds[taskId];
          state.updateTaskError = undefined;

          if (previousProjectId !== updatedTask.projectId) {
            const previousProjectTasks =
              state.tasksByProject[previousProjectId];
            if (previousProjectTasks) {
              state.tasksByProject[previousProjectId] = previousProjectTasks.filter(
                (task) => task.id !== taskId
              );
            }
          }

          const projectTasks = state.tasksByProject[updatedTask.projectId] ?? [];
          const projectIndex = projectTasks.findIndex(
            (task) => task.id === taskId
          );

          if (projectIndex >= 0) {
            projectTasks[projectIndex] = updatedTask;
          } else {
            projectTasks.push(updatedTask);
          }
          state.tasksByProject[updatedTask.projectId] = projectTasks;

          replaceTaskInColumns(state, updatedTask);

          state.taskDetailsById[taskId] = updatedTask;
          state.taskDetailsError[taskId] = undefined;
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

          removeTaskFromColumns(state, taskId);
          delete state.taskDetailsById[taskId];
          delete state.taskDetailsLoading[taskId];
          delete state.taskDetailsError[taskId];
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.deletingTaskIds[taskId] = false;
          delete state.deletingTaskIds[taskId];
          state.deleteTaskError = action.error.message;
        },
      }
    ),

    getTaskById: create.asyncThunk(
      async (taskId: string) => {
        const task = await api.fetchTaskById(taskId);
        return task;
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg;
          state.taskDetailsLoading[taskId] = true;
          state.taskDetailsError[taskId] = undefined;
        },
        fulfilled: (state, action) => {
          const task = action.payload;
          state.taskDetailsLoading[task.id] = false;
          state.taskDetailsError[task.id] = undefined;
          state.taskDetailsById[task.id] = task;

          const projectTasks = state.tasksByProject[task.projectId] ?? [];
          const projectIndex = projectTasks.findIndex(
            (item) => item.id === task.id
          );
          if (projectIndex >= 0) {
            projectTasks[projectIndex] = task;
          } else {
            projectTasks.push(task);
          }
          state.tasksByProject[task.projectId] = projectTasks;

          const columnTasks = ensureColumnTasks(state, task.columnId);
          const columnIndex = columnTasks.findIndex((item) => item.id === task.id);
          if (columnIndex >= 0) {
            columnTasks[columnIndex] = task;
          } else {
            columnTasks.push(task);
          }
          state.tasksByColumn[task.columnId] = columnTasks;
          state.columnTasksLoaded[task.columnId] = true;
          state.columnTasksError[task.columnId] = undefined;
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg;
          state.taskDetailsLoading[taskId] = false;
          state.taskDetailsError[taskId] = action.error.message;
        },
      }
    ),

    clearTasksForColumn: create.reducer(
      (state, action: { payload: string }) => {
        const columnId = action.payload;
        const tasksToRemove = state.tasksByColumn[columnId] ?? [];
        delete state.tasksByColumn[columnId];
        delete state.columnTasksLoading[columnId];
        delete state.columnTasksError[columnId];
        delete state.columnTasksLoaded[columnId];

        for (const [projectId, tasks] of Object.entries(state.tasksByProject)) {
          state.tasksByProject[projectId] = tasks.filter(
            (task) => task.columnId !== columnId
          );
        }

        tasksToRemove.forEach((task) => {
          delete state.taskDetailsById[task.id];
          delete state.taskDetailsLoading[task.id];
          delete state.taskDetailsError[task.id];
        });
      }
    ),

    moveTask: create.asyncThunk(
      async ({
        taskId,
        destinationColumnId,
        orderIndex,
      }: {
        taskId: string;
        sourceColumnId: string;
        destinationColumnId: string;
        orderIndex: number;
      }) => {
        const payload: MoveTaskDto = {
          columnId: destinationColumnId,
          orderIndex,
        };

        const movedTask = await api.moveTaskById(taskId, payload);
        return movedTask;
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.movingTaskIds[taskId] = true;
          state.moveTaskError = undefined;
        },
        fulfilled: (state, action) => {
          const movedTask = action.payload;
          const { taskId, sourceColumnId, destinationColumnId, orderIndex } =
            action.meta.arg;

          state.movingTaskIds[taskId] = false;
          delete state.movingTaskIds[taskId];
          state.moveTaskError = undefined;

          if (sourceColumnId === destinationColumnId) {
            const columnTasks = state.tasksByColumn[sourceColumnId] ?? [];
            const withoutTask = columnTasks.filter((task) => task.id !== taskId);
            const targetIndex = Math.max(
              0,
              Math.min(orderIndex, withoutTask.length)
            );
            withoutTask.splice(targetIndex, 0, movedTask);
            withoutTask.forEach((task, index) => {
              task.orderIndex = index;
            });
            state.tasksByColumn[sourceColumnId] = withoutTask;
            state.columnTasksLoaded[sourceColumnId] = true;
            state.columnTasksError[sourceColumnId] = undefined;
          } else {
            const sourceTasks = state.tasksByColumn[sourceColumnId] ?? [];
            const sourceWithoutTask = sourceTasks.filter(
              (task) => task.id !== taskId
            );
            sourceWithoutTask.forEach((task, index) => {
              task.orderIndex = index;
            });
            state.tasksByColumn[sourceColumnId] = sourceWithoutTask;
            state.columnTasksLoaded[sourceColumnId] = true;
            state.columnTasksError[sourceColumnId] = undefined;

            const destinationTasks = state.tasksByColumn[destinationColumnId] ?? [];
            const destWithoutTask = destinationTasks.filter(
              (task) => task.id !== taskId
            );
            const targetIndex = Math.max(
              0,
              Math.min(orderIndex, destWithoutTask.length)
            );
            destWithoutTask.splice(targetIndex, 0, movedTask);
            destWithoutTask.forEach((task, index) => {
              task.orderIndex = index;
            });
            state.tasksByColumn[destinationColumnId] = destWithoutTask;
            state.columnTasksLoaded[destinationColumnId] = true;
            state.columnTasksError[destinationColumnId] = undefined;
          }

          state.taskDetailsById[taskId] = movedTask;
          state.taskDetailsError[taskId] = undefined;

          const projectTasks = state.tasksByProject[movedTask.projectId] ?? [];
          const projectIndex = projectTasks.findIndex(
            (task) => task.id === taskId
          );

          if (projectIndex >= 0) {
            projectTasks[projectIndex] = movedTask;
          } else {
            projectTasks.push(movedTask);
          }
          state.tasksByProject[movedTask.projectId] = projectTasks;
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.movingTaskIds[taskId] = false;
          delete state.movingTaskIds[taskId];
          state.moveTaskError = action.error.message;
        },
      }
    ),
  }),
  selectors: {
    selectTasksByProject: (state, projectId: string): Task[] =>
      state.tasksByProject[projectId] ?? [],
    selectTasksByColumn: (state, columnId: string): Task[] =>
      state.tasksByColumn[columnId] ?? [],
    selectIsLoading: (state) => state.isLoading,
    selectError: (state) => state.error,
    selectIsCreating: (state) => state.isCreating,
    selectCreateTaskError: (state) => state.createTaskError,
    selectUpdatingTaskIds: (state) => state.updatingTaskIds,
    selectUpdateTaskError: (state) => state.updateTaskError,
    selectDeletingTaskIds: (state) => state.deletingTaskIds,
    selectDeleteTaskError: (state) => state.deleteTaskError,
    selectMovingTaskIds: (state) => state.movingTaskIds,
    selectMoveTaskError: (state) => state.moveTaskError,
    selectColumnTasksLoading: (state, columnId: string): boolean =>
      Boolean(state.columnTasksLoading[columnId]),
    selectColumnTasksError: (
      state,
      columnId: string
    ): string | undefined => state.columnTasksError[columnId],
    selectColumnTasksLoaded: (state, columnId: string): boolean =>
      Boolean(state.columnTasksLoaded[columnId]),
    selectTaskDetailsById: (state, taskId: string): Task | undefined =>
      state.taskDetailsById[taskId],
    selectTaskDetailsLoadingById: (state, taskId: string): boolean =>
      Boolean(state.taskDetailsLoading[taskId]),
    selectTaskDetailsErrorById: (
      state,
      taskId: string
    ): string | undefined => state.taskDetailsError[taskId],
  },
});


export const {
  getTasksByProject,
  getTasksByColumn,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTaskById,
  clearTasksForColumn,
} = tasksSlice.actions;

export const {
  selectTasksByProject,
  selectTasksByColumn,
  selectIsLoading: selectTasksIsLoading,
  selectError: selectTasksError,
  selectIsCreating: selectIsCreatingTask,
  selectCreateTaskError,
  selectUpdatingTaskIds,
  selectUpdateTaskError,
  selectDeletingTaskIds,
  selectDeleteTaskError,
  selectMovingTaskIds,
  selectMoveTaskError,
  selectColumnTasksLoading,
  selectColumnTasksError,
  selectColumnTasksLoaded,
  selectTaskDetailsById,
  selectTaskDetailsLoadingById,
  selectTaskDetailsErrorById,
} = tasksSlice.selectors;
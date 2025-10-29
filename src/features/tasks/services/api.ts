import axiosInstance from "../../../lib/axiosInstance";
import type {
  BulkMoveTasksDto,
  BulkUpdateTaskStatusDto,
  CreateTaskDto,
  MoveTaskDto,
  ProjectTasksFilters,
  Task,
  UpdateTaskDto,
} from "../types";

const TASKS_BASE_PATH = "/tasks";

export const fetchTaskById = async (taskId: string): Promise<Task> => {
  const res = await axiosInstance.get(`${TASKS_BASE_PATH}/${taskId}`);
  return res.data;
};

export const updateTaskById = async (
  taskId: string,
  taskDto: UpdateTaskDto
): Promise<Task> => {
  const res = await axiosInstance.put(`${TASKS_BASE_PATH}/${taskId}`, taskDto);
  return res.data;
};

export const deleteTaskById = async (taskId: string): Promise<void> => {
  await axiosInstance.delete(`${TASKS_BASE_PATH}/${taskId}`);
};

export const fetchTasksByProject = async ({
  projectId,
  filters,
}: {
  projectId: string;
  filters?: ProjectTasksFilters;
}): Promise<Task[]> => {
  const params = Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([, value]) => value !== undefined && value !== ""
    )
  );

  const res = await axiosInstance.get(`${TASKS_BASE_PATH}/project/${projectId}`, {
    params,
  });
  return res.data;
};

export const fetchTasksByColumn = async (columnId: string): Promise<Task[]> => {
  const res = await axiosInstance.get(`${TASKS_BASE_PATH}/column/${columnId}`);
  return res.data;
};

export const createTaskForProject = async (
  projectId: string,
  taskDto: CreateTaskDto
): Promise<Task> => {
  const res = await axiosInstance.post(
    `${TASKS_BASE_PATH}/project/${projectId}`,
    taskDto
  );
  return res.data;
};

export const moveTaskById = async (
  taskId: string,
  payload: MoveTaskDto
): Promise<Task> => {
  const res = await axiosInstance.patch(
    `${TASKS_BASE_PATH}/${taskId}/move`,
    payload
  );
  return res.data;
};

export const bulkUpdateTaskStatus = async (
  payload: BulkUpdateTaskStatusDto
): Promise<Task[]> => {
  const res = await axiosInstance.patch(
    `${TASKS_BASE_PATH}/bulk/status`,
    payload
  );
  return res.data;
};

export const bulkMoveTasks = async (
  payload: BulkMoveTasksDto
): Promise<Task[]> => {
  const res = await axiosInstance.patch(
    `${TASKS_BASE_PATH}/bulk/move`,
    payload
  );
  return res.data;
};
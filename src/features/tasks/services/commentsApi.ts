import axiosInstance from "../../../lib/axiosInstance";
import type {
  CreateTaskCommentDto,
  TaskComment,
  UpdateTaskCommentDto,
} from "../types";

const TASKS_BASE_PATH = "/tasks";

const buildCommentsPath = (taskId: string) => `${TASKS_BASE_PATH}/${taskId}/comments`;

export const fetchTaskComments = async (taskId: string): Promise<TaskComment[]> => {
  const res = await axiosInstance.get(buildCommentsPath(taskId));
  return res.data;
};

export const fetchTaskCommentById = async (
  taskId: string,
  commentId: string
): Promise<TaskComment> => {
  const res = await axiosInstance.get(`${buildCommentsPath(taskId)}/${commentId}`);
  return res.data;
};

export const createTaskComment = async (
  taskId: string,
  payload: CreateTaskCommentDto
): Promise<TaskComment> => {
  const res = await axiosInstance.post(buildCommentsPath(taskId), payload);
  return res.data;
};

export const updateTaskComment = async (
  taskId: string,
  commentId: string,
  payload: UpdateTaskCommentDto
): Promise<TaskComment> => {
  const res = await axiosInstance.put(
    `${buildCommentsPath(taskId)}/${commentId}`,
    payload
  );
  return res.data;
};

export const deleteTaskComment = async (
  taskId: string,
  commentId: string
): Promise<void> => {
  await axiosInstance.delete(`${buildCommentsPath(taskId)}/${commentId}`);
};
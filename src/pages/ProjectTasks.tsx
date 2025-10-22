import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllProjects,
  selectProjects,
} from "../features/projects/slice/projectsSlice";
import TaskForm from "../features/tasks/components/TaskForm";
import TasksList from "../features/tasks/components/TasksList";
import {
  deleteTask,
  getTasksByProject,
  selectDeleteTaskError,
  selectDeletingTaskIds,
  selectTasksByProject,
  selectTasksError,
  selectTasksIsLoading,
  selectUpdateTaskError,
  selectUpdatingTaskIds,
  updateTask,
} from "../features/tasks/slice/tasksSlice";
import type { UpdateTaskDto } from "../features/tasks/types";

export default function ProjectTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const projects = useAppSelector(selectProjects);
  const tasks = useAppSelector((state) =>
    projectId ? selectTasksByProject(state, projectId) : []
  );
  const isLoadingTasks = useAppSelector(selectTasksIsLoading);
  const tasksError = useAppSelector(selectTasksError);
  const updatingTaskIds = useAppSelector(selectUpdatingTaskIds);
  const deletingTaskIds = useAppSelector(selectDeletingTaskIds);
  const updateTaskError = useAppSelector(selectUpdateTaskError);
  const deleteTaskError = useAppSelector(selectDeleteTaskError);

  // 👇 форма открывается автоматически, если задач нет
  const [isCreating, setIsCreating] = useState(() => tasks.length === 0);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(getAllProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) {
      dispatch(getTasksByProject(projectId));
    }
  }, [dispatch, projectId]);

  // ❌ УДАЛИЛИ этот эффект, чтобы форма не закрывалась сразу после открытия
  // useEffect(() => {
  //   if (!isLoadingTasks && tasks.length > 0 && isCreating) {
  //     setIsCreating(false);
  //   }
  // }, [isCreating, isLoadingTasks, tasks.length]);

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId]
  );

  const handleUpdateTask = async (taskId: string, updates: UpdateTaskDto) => {
    if (!projectId) return;
    await dispatch(updateTask({ projectId, taskId, updates })).unwrap();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    await dispatch(deleteTask({ projectId, taskId })).unwrap();
  };

  if (!projectId) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Не удалось определить проект. Вернитесь к списку проектов и выберите
          нужный снова.
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="mt-4 inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          К проектам
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          ← Назад к проектам
        </button>

        <div className="text-right">
          <h1 className="text-2xl font-semibold text-gray-900">
            {project?.title || "Проект"}
          </h1>
          <p className="text-sm text-gray-500">
            {project?.description || "Управление задачами проекта"}
          </p>
        </div>
      </div>

      {tasksError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {tasksError}
        </div>
      )}

      {isLoadingTasks && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          Загружаем задачи проекта...
        </div>
      )}

      {/* ✅ форма теперь открывается корректно */}
      {!isLoadingTasks && isCreating && (
        <TaskForm
          projectId={projectId}
          showCancelButton={tasks.length > 0}
          onCancel={tasks.length > 0 ? () => setIsCreating(false) : undefined}
          onCreated={() => setIsCreating(false)}
        />
      )}

      {!isLoadingTasks && !isCreating && (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Добавить задачу
        </button>
      )}

      {!isLoadingTasks && tasks.length === 0 && !isCreating && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
          В этом проекте еще нет задач. Нажмите «Добавить задачу», чтобы создать
          первую.
        </div>
      )}

      {!isLoadingTasks && tasks.length > 0 && (
        <TasksList
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          updatingTaskIds={updatingTaskIds}
          deletingTaskIds={deletingTaskIds}
          updateTaskError={updateTaskError}
          deleteTaskError={deleteTaskError}
        />
      )}
    </div>
  );
}

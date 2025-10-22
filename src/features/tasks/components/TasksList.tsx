import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import type { Task, UpdateTaskDto } from "../types";

interface TasksListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: UpdateTaskDto) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  updatingTaskIds: Record<string, boolean>;
  deletingTaskIds: Record<string, boolean>;
  updateTaskError?: string;
  deleteTaskError?: string;
}

interface TaskFormState {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

const mapTaskToFormState = (task: Task): TaskFormState => ({
  title: task.title ?? "",
  description: task.description ?? "",
  status: task.status ?? "",
  priority: task.priority ?? "",
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
});

interface TaskListItemProps {
  task: Task;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdateTask: (taskId: string, updates: UpdateTaskDto) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

function TaskListItem({
  task,
  isUpdating,
  isDeleting,
  onUpdateTask,
  onDeleteTask,
}: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<TaskFormState>(mapTaskToFormState(task));
  const [localError, setLocalError] = useState<string | undefined>();

  useEffect(() => {
    setFormState(mapTaskToFormState(task));
  }, [task]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = formState.title.trim();
    if (!title) {
      setLocalError("Введите название задачи");
      return;
    }

    const updates: UpdateTaskDto = {
      title,
      description: formState.description.trim()
        ? formState.description.trim()
        : undefined,
      status: formState.status.trim() ? formState.status.trim() : undefined,
      priority: formState.priority.trim()
        ? formState.priority.trim()
        : undefined,
      dueDate: formState.dueDate.trim() ? formState.dueDate.trim() : undefined,
    };

    try {
      await onUpdateTask(task.id, updates);
      setIsEditing(false);
      setLocalError(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormState(mapTaskToFormState(task));
    setLocalError(undefined);
  };

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }
    try {
      await onDeleteTask(task.id);
    } catch (error) {
      console.error(error);
    }
  };

  if (isEditing) {
    return (
      <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor={`title-${task.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Название
            </label>
            <input
              id={`title-${task.id}`}
              name="title"
              type="text"
              value={formState.title}
              onChange={handleChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`description-${task.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Описание
            </label>
            <textarea
              id={`description-${task.id}`}
              name="description"
              rows={3}
              value={formState.description}
              onChange={handleChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              disabled={isUpdating}
            />
          </div>

          {localError && (
            <p className="text-sm text-red-500">{localError}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={isUpdating}
            >
              {isUpdating ? "Сохраняем..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={isUpdating}
            >
              Отменить
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500">
            {task.description || "Нет описания"}
          </p>
        </div>
      </div>

      

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:w-auto"
          disabled={isUpdating || isDeleting}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          disabled={isDeleting || isUpdating}
        >
          {isDeleting ? "Удаляем..." : "Удалить"}
        </button>
      </div>
    </article>
  );
}

export default function TasksList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  updatingTaskIds,
  deletingTaskIds,
  updateTaskError,
  deleteTaskError,
}: TasksListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Задачи проекта</h2>
        <p className="text-sm text-gray-500">
          Управляйте задачами: редактируйте детали или удаляйте ненужные позиции
        </p>
      </div>

      {(updateTaskError || deleteTaskError) && (
        <div className="space-y-2">
          {updateTaskError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {updateTaskError}
            </div>
          )}
          {deleteTaskError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {deleteTaskError}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            isUpdating={Boolean(updatingTaskIds[task.id])}
            isDeleting={Boolean(deletingTaskIds[task.id])}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </section>
  );
}
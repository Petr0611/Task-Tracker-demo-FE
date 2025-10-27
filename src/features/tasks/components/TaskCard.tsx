import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Task, UpdateTaskDto } from "../types";
import { useAppDispatch} from "../../../app/hooks";
import {
  getTaskById,
} from "../slice/tasksSlice";
import { formatDueDate, normalizeDueDate, toDueDateInputValue } from "../utils/formatDueDate";

interface TaskCardProps {
  task: Task;
  isUpdating: boolean;
  isDeleting: boolean;
  isMoving: boolean;
  onUpdateTask: (taskId: string, updates: UpdateTaskDto) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenComments: () => void;
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
  dueDate: toDueDateInputValue(task.dueDate),
});

const TASK_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

export default function TaskCard({
  task,
  isUpdating,
  isDeleting,
  isMoving,
  onUpdateTask,
  onDeleteTask,
  onOpenComments,
}: TaskCardProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails] = useState(false);
  const [formState, setFormState] = useState<TaskFormState>(
    mapTaskToFormState(task)
  );
  const [localError, setLocalError] = useState<string | undefined>();

  const isBusy = isUpdating || isDeleting || isMoving;

  useEffect(() => {
    setFormState(mapTaskToFormState(task));
  }, [task]);

  useEffect(() => {
    if (showDetails) {
      void dispatch(getTaskById(task.id));
    }
  }, [dispatch, showDetails, task.id]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      dueDate: normalizeDueDate(formState.dueDate),
    };

    try {
      await onUpdateTask(task.id, updates);
      setIsEditing(false);
      setLocalError(undefined);
    } catch (updateError) {
      console.error(updateError);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormState(mapTaskToFormState(task));
    setLocalError(undefined);
  };

  const handleDelete = async () => {
    if (isDeleting || isMoving) {
      return;
    }

    try {
      await onDeleteTask(task.id);
    } catch (deleteError) {
      console.error(deleteError);
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
              disabled={isBusy}
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
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`dueDate-${task.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Срок выполнения
            </label>
            <input
              id={`dueDate-${task.id}`}
              name="dueDate"
              type="datetime-local"
              value={formState.dueDate}
              onChange={handleChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`status-${task.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Статус
            </label>
            <select
              id={`status-${task.id}`}
              name="status"
              value={formState.status}
              onChange={handleChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              disabled={isBusy}
            >
              <option value="">Не выбран</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {localError && (
            <p className="text-sm text-red-500">{localError}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={isBusy}
            >
              {isUpdating ? "Сохраняем..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={isBusy}
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
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500">
              {task.description || "Нет описания"}
            </p>
            {task.dueDate && (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Срок:</span>{" "}
                {formatDueDate(task.dueDate)}
              </p>
            )}
            <div className="text-sm text-gray-700">
              <span className="font-medium">Статус: </span>
              <span>{task.status ?? "Не указан"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenComments}
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto"
          disabled={isBusy}
        >
          Комментарии
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:w-auto"
          disabled={isBusy}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          disabled={isBusy}
        >
          {isDeleting ? "Удаляем..." : "Удалить"}
        </button>
      </div>
    </article>
  );
}
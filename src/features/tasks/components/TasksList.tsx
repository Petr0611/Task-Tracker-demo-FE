import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";
import "./TaskCard.css";
import "../../../css/ProjectTasksList.css";
import type { Task, UpdateTaskDto } from "../types";
import { normalizeDueDate, toDueDateInputValue } from "../utils/formatDueDate";
import { DeadlineTimer } from "./DeadlineTimer";

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
  dueDate: toDueDateInputValue(task.dueDate),
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
      dueDate: normalizeDueDate(formState.dueDate),
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

  const baseCardClasses = clsx(
    "task-card",
    "project-task-card",
    (isUpdating || isDeleting) && "project-task-card--busy"
  );

  if (isEditing) {
    return (
      <article className={clsx(baseCardClasses, "task-card--editing")}>
        <form className="task-card__form" onSubmit={handleSubmit}>
          <div className="task-card__field">
            <label
              htmlFor={`title-${task.id}`}
              className="task-card__label"
            >
              Название
            </label>
            <input
              id={`title-${task.id}`}
              name="title"
              type="text"
              value={formState.title}
              onChange={handleChange}
              className="task-card__input"
              disabled={isUpdating}
            />
          </div>

          <div className="task-card__field">
            <label
              htmlFor={`description-${task.id}`}
              className="task-card__label"
            >
              Описание
            </label>
            <textarea
              id={`description-${task.id}`}
              name="description"
              rows={3}
              value={formState.description}
              onChange={handleChange}
              className="task-card__textarea"
              disabled={isUpdating}
            />
          </div>

          <div className="task-card__field">
            <label
              htmlFor={`dueDate-${task.id}`}
              className="task-card__label"
            >
              Срок выполнения
            </label>
            <input
              id={`dueDate-${task.id}`}
              name="dueDate"
              type="datetime-local"
              value={formState.dueDate}
              onChange={handleChange}
              className="task-card__input"
              disabled={isUpdating}
            />
          </div>
          {localError && (
            <p className="task-card__error project-task-card__form-error">
              {localError}
            </p>
          )}

          <div className="task-card__actions-row project-task-card__form-actions">
            <button
              type="submit"
              className="task-card__button task-card__button--primary"
              disabled={isUpdating}
            >
              {isUpdating ? "Сохраняем..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={clsx(
                "task-card__button",
                "task-card__button--outline",
                "project-task-card__button--outline"
              )}
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
    <article className={baseCardClasses}>
      <div className="task-card__body project-task-card__content">
        <div className="task-card__header">
          <div className="task-card__summary">
            <h3 className="task-card__title">{task.title}</h3>
            <p className="task-card__description">
              {task.description || "Нет описания"}
            </p>
            {task.dueDate && (
              <div className="task-card__deadline">
                <DeadlineTimer dueDate={task.dueDate} />
              </div>
            )}
            <div className="project-task-card__meta-block">
              <div className="task-card__meta-line">
                <span className="task-card__meta-label">Статус:</span>
                <span className="task-card__meta-value">
                  {task.status ?? "Не указан"}
                </span>
              </div>
              <div className="task-card__meta-line">
                <span className="task-card__meta-label">Приоритет:</span>
                <span className="task-card__meta-value">
                  {task.priority ?? "Не указан"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="task-card__actions-row project-task-card__actions-row">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={clsx(
            "task-card__button",
            "task-card__button--outline",
            "project-task-card__button--outline"
          )}
          disabled={isUpdating || isDeleting}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className={clsx(
            "task-card__button",
            "project-task-card__button--danger"
          )} 
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
    <section className="project-tasks-list">
      <div className="project-tasks-list__header">
        <h2 className="project-tasks-list__title">Задачи проекта</h2>
        <p className="project-tasks-list__description">
          Управляйте задачами: редактируйте детали или удаляйте ненужные позиции
        </p>
      </div>

      {(updateTaskError || deleteTaskError) && (
        <div className="project-tasks-list__alerts">
          {updateTaskError && (
            <div className="project-tasks-list__alert project-tasks-list__alert--error">
              {updateTaskError}
            </div>
          )}
          {deleteTaskError && (
            <div className="project-tasks-list__alert project-tasks-list__alert--error">
              {deleteTaskError}
            </div>
          )}
        </div>
      )}

      <div className="project-tasks-list__grid">
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
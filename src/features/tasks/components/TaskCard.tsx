import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type SVGProps,
} from "react";
import clsx from "clsx";
import type { Task, UpdateTaskDto } from "../types";
import { useAppDispatch } from "../../../app/hooks";
import { getTaskById } from "../slice/tasksSlice";
import { normalizeDueDate, toDueDateInputValue } from "../utils/formatDueDate";
import { DeadlineTimer } from "./DeadlineTimer";
import TaskAttachmentPreviewModal from "./TaskAttachmentPreviewModal";
import {
  getAttachmentDisplayName,
  getAttachmentUrl,
} from "../utils/attachments";
import "../../../css/TaskCard.css"

interface TaskCardProps {
  task: Task;
  isUpdating: boolean;
  isDeleting: boolean;
  isMoving: boolean;
  onUpdateTask: (taskId: string, updates: UpdateTaskDto) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUploadAttachment: (taskId: string, file: File) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  onOpenComments: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
  selectionDisabled?: boolean;
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
  onUploadAttachment,
  onDeleteAttachment,
  onOpenComments,
  isSelected,
  onToggleSelection,
  selectionDisabled = false,
}: TaskCardProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [formState, setFormState] = useState<TaskFormState>(
    mapTaskToFormState(task)
  );
  const [localError, setLocalError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [previewAttachmentId, setPreviewAttachmentId] = useState<string | null>(
    null
  );

  const attachments = useMemo(
    () => task.attachments ?? [],
    [task.attachments]
  );
  const hasAttachments = attachments.length > 0;
  const previewAttachment = attachments.find(
    (attachmentItem) => attachmentItem.id === previewAttachmentId
  );

  const attachmentFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="task-card__hidden-file-input"
      onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }

        try {
          await onUploadAttachment(task.id, file);
        } catch (uploadError) {
          console.error(uploadError);
        } finally {
          event.target.value = "";
        }
      }}
    />
  );

  const isBusy = isUpdating || isDeleting || isMoving;
  const selectionIsDisabled = selectionDisabled || isBusy;
  const handleAttachmentUploadClick = () => {
    if (isBusy) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (isBusy) {
      return;
    }

    try {
      await onDeleteAttachment(task.id, attachmentId);
    } catch (removeError) {
      console.error(removeError);
    }
  };

  const handleOpenAttachmentPreview = (attachmentId: string) => {
    setPreviewAttachmentId(attachmentId);
  };

  const handleCloseAttachmentPreview = () => {
    setPreviewAttachmentId(null);
  };

  const attachmentsGallery = hasAttachments ? (
    <ul className="task-card__attachment-list">
      {attachments.map((attachment) => {
        const attachmentUrl = getAttachmentUrl(attachment);
        const attachmentName = getAttachmentDisplayName(attachment);

        return (
          <li key={attachment.id} className="task-card__attachment-item">
            <button
              type="button"
              onClick={() => handleOpenAttachmentPreview(attachment.id)}
              className="task-card__attachment-preview-button"
              aria-label={`Открыть вложение ${attachmentName}`}
            >
              {attachmentUrl ? (
                <img
                  src={attachmentUrl}
                  alt={attachmentName}
                  className="task-card__attachment-image"
                  loading="lazy"
                />
              ) : (
                <div className="task-card__attachment-fallback">
                  {attachmentName}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRemoveAttachment(attachment.id)}
              className="task-card__attachment-remove-button"
              disabled={isBusy}
            >
              <span className="task-card__sr-only">Удалить вложение</span>
              <XMarkIcon
                className="task-card__attachment-remove-icon"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  useEffect(() => {
    setFormState(mapTaskToFormState(task));
  }, [task]);

  useEffect(() => {
    if (!previewAttachmentId) {
      return;
    }

    const stillExists = attachments.some(
      (attachmentItem) => attachmentItem.id === previewAttachmentId
    );

    if (!stillExists) {
      setPreviewAttachmentId(null);
    }
  }, [attachments, previewAttachmentId]);

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

  const handleToggleSelection = () => {
    if (selectionIsDisabled) {
      return;
    }
    onToggleSelection();
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
      setShowActionsMenu(false);
      await onDeleteTask(task.id);
    } catch (deleteError) {
      console.error(deleteError);
    }
  };

  const handleStartEdit = () => {
    if (isBusy) {
      return;
    }

    setShowActionsMenu(false);
    setIsEditing(true);
  };

  const handleToggleActionsMenu = () => {
    if (isBusy) {
      return;
    }

    setShowActionsMenu((prev) => !prev);
  };

  useEffect(() => {
    if (!showActionsMenu) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) {
        return;
      }

      const target = event.target as Node | null;

      if (target && menuRef.current.contains(target)) {
        return;
      }

      setShowActionsMenu(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowActionsMenu(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showActionsMenu]);

  useEffect(() => {
    if (!isBusy) {
      return;
    }

    setShowActionsMenu(false);
  }, [isBusy]);

  const selectionControl = (
    <input
      type="checkbox"
      className="task-card__selection-control"
      checked={isSelected}
      onChange={handleToggleSelection}
      disabled={selectionIsDisabled}
      aria-label="Выбрать задачу для массовых действий"
    />
  );


  if (isEditing) {
    return (
      <article
        className={clsx(
          "task-card",
          "task-card--editing",
          isSelected && "task-card--selected"
        )}
      >
        {attachmentFileInput}
        <div className="task-card__selection-hint">
          {selectionControl}
          <span className="task-card__selection-hint-text">
            {isSelected
              ? "Задача включена в массовые действия"
              : "Отметьте, чтобы добавить к массовым действиям"}
          </span>
        </div>
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
              disabled={isBusy}
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
              disabled={isBusy}
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
              disabled={isBusy}
            />
          </div>
          <div className="task-card__field">
            <label
              htmlFor={`status-${task.id}`}
              className="task-card__label"
            >
              Статус
            </label>
            <select
              id={`status-${task.id}`}
              name="status"
              value={formState.status}
              onChange={handleChange}
              className="task-card__select"
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
          <div className="task-card__attachments-editor">
            <span className="task-card__label">Вложения</span>
            {attachmentsGallery ?? (
              <p className="task-card__attachments-empty">Вложений нет</p>
            )}
            <button
              type="button"
              onClick={handleAttachmentUploadClick}
              className="task-card__button task-card__button--dashed"
              disabled={isBusy}
            >
              <PaperClipIcon
                className="task-card__button-icon"
                aria-hidden="true"
              />
            </button>
          </div>
          {localError && (
            <p className="task-card__error">{localError}</p>
          )}


          <div className="task-card__actions-row">
            <button
              type="submit"
              className="task-card__button task-card__button--primary"
              disabled={isBusy}
            >
              {isUpdating ? "Сохраняем..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="task-card__button task-card__button--outline"
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
    <article
      className={clsx(
        "task-card",
        isSelected && "task-card--selected"
      )}
    >
      {attachmentFileInput}
      <div className="task-card__body">
        <div className="task-card__header">
          {selectionControl}
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
            <div className="task-card__meta-line">
              <span className="task-card__meta-label">Статус:</span>
              <span className="task-card__meta-value">
                {task.status ?? "Не указан"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasAttachments && (
        <div className="task-card__attachments">
          <h4 className="task-card__attachments-heading">Вложения</h4>
          {attachmentsGallery}
        </div>
      )}

      <div className="task-card__actions-row">
        <button
          type="button"
          onClick={handleAttachmentUploadClick}
          className="task-card__button task-card__button--dashed"
          disabled={isBusy}
        >
          <PaperClipIcon
            className="task-card__button-icon"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={onOpenComments}
          className="task-card__button task-card__button--comments" 
          disabled={isBusy}
        >
          Комментарии
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleActionsMenu}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:w-auto"
            disabled={isBusy}
            aria-haspopup="menu"
            aria-expanded={showActionsMenu}
            aria-controls={`task-actions-${task.id}`}
          >
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Дополнительные действия с задачей</span>
          </button>
          {showActionsMenu && (
            <div
              ref={menuRef}
              id={`task-actions-${task.id}`}
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
            >
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                role="menuitem"
              >
                <PencilIcon className="h-4 w-4" aria-hidden="true" />
                Редактировать
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                role="menuitem"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                {isDeleting ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          )}
        </div>
      </div>
      {previewAttachment && (
        <TaskAttachmentPreviewModal
          attachment={previewAttachment}
          isOpen={Boolean(previewAttachment)}
          onClose={handleCloseAttachmentPreview}
        />
      )}
    </article>
  );
}
function PaperClipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5L12.5 20a5 5 0 01-7.07-7.07l9-9a3.5 3.5 0 014.95 4.95l-9 9a2 2 0 01-2.83-2.83l8.5-8.5"
      />
    </svg>
  );
}

function XMarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function EllipsisVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <circle cx={12} cy={5} r={1.5} />
      <circle cx={12} cy={12} r={1.5} />
      <circle cx={12} cy={19} r={1.5} />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.651-1.65a1.5 1.5 0 112.122 2.122l-9.193 9.193a3 3 0 01-1.061.707l-3.11 1.037a.75.75 0 01-.948-.948l1.037-3.11a3 3 0 01.707-1.06l6.898-6.9"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 11.25V19.5a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 014.5 19.5v-12A1.5 1.5 0 016 6h8.25" />
    </svg>
  );
}

function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 4.5h5a1 1 0 011 1V7h4.25M4.25 7H20.5M6.5 7v12a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5V7"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11.5v6m4-6v6" />
    </svg>
  );
}
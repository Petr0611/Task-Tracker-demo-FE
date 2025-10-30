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
  const [formState, setFormState] = useState<TaskFormState>(
    mapTaskToFormState(task)
  );
  const [localError, setLocalError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      className="hidden"
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
    <ul className="flex flex-wrap gap-3">
      {attachments.map((attachment) => {
        const attachmentUrl = getAttachmentUrl(attachment);
        const attachmentName = getAttachmentDisplayName(attachment);

        return (
          <li
            key={attachment.id}
            className="group relative h-20 w-20 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
          >
            <button
              type="button"
              onClick={() => handleOpenAttachmentPreview(attachment.id)}
              className="h-full w-full"
              aria-label={`Открыть вложение ${attachmentName}`}
            >
              {attachmentUrl ? (
                <img
                  src={attachmentUrl}
                  alt={attachmentName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-gray-500">
                  {attachmentName}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRemoveAttachment(attachment.id)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-black focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-black group-hover:opacity-100"
              disabled={isBusy}
            >
              <span className="sr-only">Удалить вложение</span>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
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
      await onDeleteTask(task.id);
    } catch (deleteError) {
      console.error(deleteError);
    }
  };

  const selectionControl = (
    <input
      type="checkbox"
      className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-black focus:ring-black disabled:cursor-not-allowed"
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
          "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
          isSelected && "border-black ring-2 ring-black/40"
        )}
      >
        {attachmentFileInput}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          {selectionControl}
          <span>
            {isSelected
              ? "Задача включена в массовые действия"
              : "Отметьте, чтобы добавить к массовым действиям"}
          </span>
        </div>
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
           <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">
              Вложения
            </span>
            {attachmentsGallery ?? (
              <p className="text-sm text-gray-500">Вложений нет</p>
            )}
            <button
              type="button"
              onClick={handleAttachmentUploadClick}
              className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              disabled={isBusy}
            >
              <PaperClipIcon className="h-4 w-4" aria-hidden="true" />
              Прикрепить файл
            </button>
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
    <article
      className={clsx(
        "rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors",
        isSelected && "border-black ring-2 ring-black/40"
      )}
    >
      {attachmentFileInput}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {selectionControl}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500">
                {task.description || "Нет описания"}
              </p>
              {task.dueDate && <DeadlineTimer dueDate={task.dueDate} />}
              <div className="text-sm text-gray-700">
                <span className="font-medium">Статус: </span>
                <span>{task.status ?? "Не указан"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasAttachments && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Вложения</h4>
          {attachmentsGallery}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAttachmentUploadClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:w-auto"
          disabled={isBusy}
        >
          <PaperClipIcon className="h-4 w-4" aria-hidden="true" />
          Прикрепить
        </button>
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
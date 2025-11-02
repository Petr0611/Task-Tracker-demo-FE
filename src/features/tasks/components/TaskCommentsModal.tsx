import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { Task } from "../types";
import {
  createComment,
  deleteComment,
  getCommentsByTask,
  selectCommentsByTask,
  selectCommentsErrorByTask,
  selectCommentsLoadedByTask,
  selectCommentsLoadingByTask,
  selectCreateCommentErrorByTask,
  selectCreatingCommentByTask,
  selectDeleteCommentErrors,
  selectDeletingCommentIds,
  selectUpdateCommentErrors,
  selectUpdatingCommentIds,
  updateComment,
} from "../slice/taskCommentsSlice";

interface TaskCommentsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const formatCommentTimestamp = (value?: string): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TaskCommentsModal({
  task,
  isOpen,
  onClose,
}: TaskCommentsModalProps) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector((state) =>
    selectCommentsByTask(state, task.id)
  );
  const commentsLoading = useAppSelector((state) =>
    selectCommentsLoadingByTask(state, task.id)
  );
  const commentsLoaded = useAppSelector((state) =>
    selectCommentsLoadedByTask(state, task.id)
  );
  const commentsError = useAppSelector((state) =>
    selectCommentsErrorByTask(state, task.id)
  );
  const isCreatingComment = useAppSelector((state) =>
    selectCreatingCommentByTask(state, task.id)
  );
  const createCommentError = useAppSelector((state) =>
    selectCreateCommentErrorByTask(state, task.id)
  );
  const updatingCommentIds = useAppSelector(selectUpdatingCommentIds);
  const updateCommentErrors = useAppSelector(selectUpdateCommentErrors);
  const deletingCommentIds = useAppSelector(selectDeletingCommentIds);
  const deleteCommentErrors = useAppSelector(selectDeleteCommentErrors);

  const [newComment, setNewComment] = useState("");
  const [newCommentLocalError, setNewCommentLocalError] = useState<
    string | undefined
  >();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingLocalError, setEditingLocalError] = useState<
    string | undefined
  >();

  const sortedComments = useMemo(
    () =>
      [...comments].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      }),
    [comments]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!commentsLoaded && !commentsLoading) {
      void dispatch(getCommentsByTask(task.id));
    }
  }, [dispatch, isOpen, task.id, commentsLoaded, commentsLoading]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setNewComment("");
    setNewCommentLocalError(undefined);
    setEditingCommentId(null);
    setEditingContent("");
    setEditingLocalError(undefined);
  }, [task.id, isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCreateCommentSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const trimmed = newComment.trim();

    if (!trimmed) {
      setNewCommentLocalError("Enter a comment");
      return;
    }

    try {
      await dispatch(createComment({ taskId: task.id, text: trimmed })).unwrap();
      setNewComment("");
      setNewCommentLocalError(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
    setEditingLocalError(undefined);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
    setEditingLocalError(undefined);
  };

  const handleUpdateCommentSubmit = async (
    event: FormEvent<HTMLFormElement>,
    commentId: string
  ) => {
    event.preventDefault();
    const trimmed = editingContent.trim();

    if (!trimmed) {
      setEditingLocalError("Enter a comment");
      return;
    }

    try {
      await dispatch(
        updateComment({ taskId: task.id, commentId, text: trimmed })
      ).unwrap();
      setEditingCommentId(null);
      setEditingContent("");
      setEditingLocalError(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await dispatch(deleteComment({ taskId: task.id, commentId })).unwrap();
      if (editingCommentId === commentId) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Task comments
            </h2>
            <p className="text-sm text-gray-500">
              {task.title || "Untitled"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close comments modal"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {commentsLoading && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Loading comments...
            </div>
          )}

          {commentsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {commentsError}
            </div>
          )}

          {!commentsLoading && !commentsError && sortedComments.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              No comments yet. Be the first to share your thoughts.
            </div>
          )}

          {sortedComments.map((comment) => {
            const isUpdating = Boolean(updatingCommentIds[comment.id]);
            const isDeleting = Boolean(deletingCommentIds[comment.id]);
            const updateError = updateCommentErrors[comment.id];
            const deleteError = deleteCommentErrors[comment.id];
            const isEditing = editingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.authorName || "Project member"}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span>{formatCommentTimestamp(comment.createdAt)}</span>
                      {comment.updatedAt && (
                        <span className="ml-2 text-gray-400">
                          Updated {formatCommentTimestamp(comment.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleStartEdit(comment.id, comment.text)
                        }
                        className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        disabled={isUpdating || isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="inline-flex items-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        disabled={isDeleting || isUpdating}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  {isEditing ? (
                    <form
                      className="space-y-3"
                      onSubmit={(event) =>
                        handleUpdateCommentSubmit(event, comment.id)
                      }
                    >
                      <textarea
                        className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        rows={4}
                        value={editingContent}
                        onChange={(event) =>
                          setEditingContent(event.target.value)
                        }
                        disabled={isUpdating}
                      />
                      {(editingLocalError || updateError) && (
                        <div className="space-y-1 text-xs text-red-500">
                          {editingLocalError && <p>{editingLocalError}</p>}
                          {updateError && <p>{updateError}</p>}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {comment.text}
                    </p>
                  )}
                </div>

                {!isEditing && (updateError || deleteError) && (
                  <div className="mt-2 space-y-1 text-xs text-red-500">
                    {updateError && <p>{updateError}</p>}
                    {deleteError && <p>{deleteError}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form
          className="space-y-3 border-t border-gray-200 px-6 py-4"
          onSubmit={handleCreateCommentSubmit}
        >
          <div className="space-y-2">
            <label
              htmlFor="new-task-comment"
              className="block text-sm font-medium text-gray-700"
            >
              Add a comment
            </label>
            <textarea
              id="new-task-comment"
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              rows={4}
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Share your thoughts about the task..."
              disabled={isCreatingComment}
            />
          </div>

          {(newCommentLocalError || createCommentError) && (
            <div className="space-y-1 text-sm text-red-500">
              {newCommentLocalError && <p>{newCommentLocalError}</p>}
              {createCommentError && <p>{createCommentError}</p>}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              disabled={isCreatingComment}
            >
              {isCreatingComment ? "Saving..." : "Add comment"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
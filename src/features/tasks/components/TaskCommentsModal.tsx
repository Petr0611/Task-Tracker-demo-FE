import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import clsx from "clsx";
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
import "../../../css/TaskCard.css";

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
    <div className="task-comments-modal" onClick={handleOverlayClick}>
      <div
        className="task-comments-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-comments-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="task-comments-modal__header">
          <div className="task-comments-modal__title-group">
            <h2
              id="task-comments-modal-title"
              className="task-comments-modal__title"
            >
              Task comments
            </h2>
            <p className="task-comments-modal__subtitle">
              {task.title || "Untitled"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="task-comments-modal__close-button"
            aria-label="Close comments modal"
          >
            ×
          </button>
        </div>

        <div className="task-comments-modal__body">
          {commentsLoading && (
            <div className="task-comments-modal__status">Loading comments...</div>
          )}

          {commentsError && (
            <div
              className={clsx(
                "task-comments-modal__status",
                "task-comments-modal__status--error"
              )}
              role="alert"
            >
              {commentsError}
            </div>
          )}

          {!commentsLoading &&
            !commentsError &&
            sortedComments.length === 0 && (
              <div className="task-comments-modal__status">
                No comments yet. Be the first to share your thoughts.
              </div>
            )}

          {sortedComments.length > 0 && (
            <div className="task-comments-modal__comments">
              {sortedComments.map((comment) => {
                const isUpdating = Boolean(updatingCommentIds[comment.id]);
                const isDeleting = Boolean(deletingCommentIds[comment.id]);
                const updateError = updateCommentErrors[comment.id];
                const deleteError = deleteCommentErrors[comment.id];
                const isEditing = editingCommentId === comment.id;

                return (
                  <div
                    key={comment.id}
                    className={clsx(
                      "task-comments-modal__comment",
                      isEditing && "task-comments-modal__comment--editing"
                    )}
                  >
                    <div className="task-comments-modal__comment-header">
                      <div className="task-comments-modal__comment-meta">
                        <p className="task-comments-modal__author">
                          {comment.authorName || "Project member"}
                        </p>
                        <div className="task-comments-modal__timestamp">
                          <span>
                            {formatCommentTimestamp(comment.createdAt)}
                          </span>
                          {comment.updatedAt && (
                            <span className="task-comments-modal__timestamp-update">
                              Updated {formatCommentTimestamp(comment.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>

          {!isEditing && (
                        <div className="task-comments-modal__actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(comment.id, comment.text)
                            }
                            className={clsx(
                              "task-card__button",
                              "task-card__button--outline",
                              "task-comments-modal__action-button"
                            )}
                            disabled={isUpdating || isDeleting}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className={clsx(
                              "task-card__button",
                              "task-card__button--danger",
                              "task-comments-modal__action-button"
                            )}
                            disabled={isDeleting || isUpdating}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>

             <div>
                      {isEditing ? (
                        <form
                          className="task-comments-modal__form"
                          onSubmit={(event) =>
                            handleUpdateCommentSubmit(event, comment.id)
                          }
                        >
                          <textarea
                            className={clsx(
                              "task-card__textarea",
                              "task-comments-modal__textarea",
                              (editingLocalError || updateError) &&
                                "task-card__textarea--error"
                            )}
                            rows={4}
                            value={editingContent}
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            disabled={isUpdating}
                          />
                          {(editingLocalError || updateError) && (
                            <div
                              className="task-comments-modal__inline-errors"
                              role="alert"
                            >
                              {editingLocalError && (
                                <p className="task-card__error">
                                  {editingLocalError}
                                </p>
                              )}
                              {updateError && (
                                <p className="task-card__error">{updateError}</p>
                              )}
                            </div>
                          )}
                          <div className="task-card__actions-row">
                            <button
                              type="submit"
                              className={clsx(
                                "task-card__button",
                                "task-card__button--primary",
                                "task-comments-modal__action-button"
                              )}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className={clsx(
                                "task-card__button",
                                "task-card__button--outline",
                                "task-comments-modal__action-button"
                              )}
                              disabled={isUpdating}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="task-comments-modal__text">{comment.text}</p>
                      )}
                    </div>

                  {!isEditing && (updateError || deleteError) && (
                      <div
                        className="task-comments-modal__inline-errors"
                        role="alert"
                      >
                        {updateError && (
                          <p className="task-card__error">{updateError}</p>
                        )}
                        {deleteError && (
                          <p className="task-card__error">{deleteError}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

         <div className="task-comments-modal__footer">
          <form
            className="task-comments-modal__form"
            onSubmit={handleCreateCommentSubmit}
          >
            <div className="task-card__field">
              <label htmlFor="new-task-comment" className="task-card__label">
                Add a comment
              </label>
              <textarea
                id="new-task-comment"
                className={clsx(
                  "task-card__textarea",
                  "task-comments-modal__textarea",
                  (newCommentLocalError || createCommentError) &&
                    "task-card__textarea--error"
                )}
                rows={4}
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Share your thoughts about the task..."
                disabled={isCreatingComment}
              />
            </div>

          {(newCommentLocalError || createCommentError) && (
              <div
                className="task-comments-modal__form-errors"
                role="alert"
              >
                {newCommentLocalError && (
                  <p className="task-card__error">{newCommentLocalError}</p>
                )}
                {createCommentError && (
                  <p className="task-card__error">{createCommentError}</p>
                )}
              </div>
            )}

            <div className="task-comments-modal__footer-actions">
              <button
                type="submit"
                className={clsx(
                  "task-card__button",
                  "task-card__button--primary"
                )}
                disabled={isCreatingComment}
              >
                {isCreatingComment ? "Saving..." : "Add comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
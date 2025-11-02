import { createAppSlice } from "../../../app/createAppSlice";
import type {
  CreateTaskCommentDto,
  TaskComment,
  TaskCommentsSliceState,
  UpdateTaskCommentDto,
} from "../types";
import * as commentsApi from "../services/commentsApi";

const sanitizeCommentText = (value: string): string => value.trim();

const initialState: TaskCommentsSliceState = {
  commentsByTask: {},
  commentsLoading: {},
  commentsLoaded: {},
  commentsError: {},
  commentDetailsById: {},
  commentDetailsLoading: {},
  commentDetailsError: {},
  creatingCommentByTask: {},
  createCommentErrorByTask: {},
  updatingCommentIds: {},
  updateCommentErrorById: {},
  deletingCommentIds: {},
  deleteCommentErrorById: {},
};

const ensureTaskComments = (
  state: TaskCommentsSliceState,
  taskId: string
): TaskComment[] => {
  if (!state.commentsByTask[taskId]) {
    state.commentsByTask[taskId] = [];
  }
  return state.commentsByTask[taskId];
};

export const taskCommentsSlice = createAppSlice({
  name: "taskComments",
  initialState,
  reducers: (create) => ({
    getCommentsByTask: create.asyncThunk(
      async (taskId: string) => {
        const comments = await commentsApi.fetchTaskComments(taskId);
        return { taskId, comments };
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg;
          state.commentsLoading[taskId] = true;
          state.commentsError[taskId] = undefined;
        },
        fulfilled: (state, action) => {
          const { taskId, comments } = action.payload;
          state.commentsLoading[taskId] = false;
          state.commentsLoaded[taskId] = true;
          state.commentsError[taskId] = undefined;
          state.commentsByTask[taskId] = comments;

          comments.forEach((comment) => {
            state.commentDetailsById[comment.id] = comment;
            state.commentDetailsError[comment.id] = undefined;
          });
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg;
          state.commentsLoading[taskId] = false;
          state.commentsLoaded[taskId] = true;
          state.commentsError[taskId] = action.error.message;
          state.commentsByTask[taskId] = [];
        },
      }
    ),

    getCommentById: create.asyncThunk(
      async ({
        taskId,
        commentId,
      }: {
        taskId: string;
        commentId: string;
      }) => {
        const comment = await commentsApi.fetchTaskCommentById(taskId, commentId);
        return comment;
      },
      {
        pending: (state, action) => {
          const { commentId } = action.meta.arg;
          state.commentDetailsLoading[commentId] = true;
          state.commentDetailsError[commentId] = undefined;
        },
        fulfilled: (state, action) => {
          const comment = action.payload;
          state.commentDetailsById[comment.id] = comment;
          state.commentDetailsLoading[comment.id] = false;
          state.commentDetailsError[comment.id] = undefined;

          const taskComments = ensureTaskComments(state, comment.taskId);
          const index = taskComments.findIndex((item) => item.id === comment.id);
          if (index >= 0) {
            taskComments[index] = comment;
          } else {
            taskComments.push(comment);
          }
        },
        rejected: (state, action) => {
          const { commentId } = action.meta.arg;
          state.commentDetailsLoading[commentId] = false;
          state.commentDetailsError[commentId] = action.error.message;
        },
      }
    ),

    createComment: create.asyncThunk(
      async ({
        taskId,
        text,
      }: {
        taskId: string;
        text: string;
      }) => {
        const trimmedText = sanitizeCommentText(text);
        if (!trimmedText) {
          throw new Error("Enter a comment");
        }

        const payload: CreateTaskCommentDto = {
          text: trimmedText, 
        };

        const createdComment = await commentsApi.createTaskComment(taskId, payload);
        return createdComment;
      },
      {
        pending: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.creatingCommentByTask[taskId] = true;
          state.createCommentErrorByTask[taskId] = undefined;
        },
        fulfilled: (state, action) => {
          const createdComment = action.payload;
          const taskId = createdComment.taskId;

          state.creatingCommentByTask[taskId] = false;
          state.createCommentErrorByTask[taskId] = undefined;

          const taskComments = ensureTaskComments(state, taskId);
          taskComments.push(createdComment);

          state.commentDetailsById[createdComment.id] = createdComment;
          state.commentDetailsError[createdComment.id] = undefined;
          state.commentsLoaded[taskId] = true;
          state.commentsError[taskId] = undefined;
        },
        rejected: (state, action) => {
          const taskId = action.meta.arg.taskId;
          state.creatingCommentByTask[taskId] = false;
          state.createCommentErrorByTask[taskId] = action.error.message;
        },
      }
    ),

    updateComment: create.asyncThunk(
      async ({
        taskId,
        commentId,
        text,
      }: {
        taskId: string;
        commentId: string;
        text: string;
      }) => {
        const trimmedText = sanitizeCommentText(text);
        if (!trimmedText) {
          throw new Error("Enter a comment");
        }

        const payload: UpdateTaskCommentDto = {
          text: trimmedText, 
        };

        const updatedComment = await commentsApi.updateTaskComment(taskId, commentId, payload);
        return updatedComment;
      },
      {
        pending: (state, action) => {
          const { commentId } = action.meta.arg;
          state.updatingCommentIds[commentId] = true;
          state.updateCommentErrorById[commentId] = undefined;
        },
        fulfilled: (state, action) => {
          const updatedComment = action.payload;
          const commentId = updatedComment.id;

          delete state.updatingCommentIds[commentId];
          state.updateCommentErrorById[commentId] = undefined;

          state.commentDetailsById[commentId] = updatedComment;
          state.commentDetailsError[commentId] = undefined;

          const taskComments = ensureTaskComments(state, updatedComment.taskId);
          const index = taskComments.findIndex((item) => item.id === commentId);
          if (index >= 0) {
            taskComments[index] = updatedComment;
          } else {
            taskComments.push(updatedComment);
          }
        },
        rejected: (state, action) => {
          const { commentId } = action.meta.arg;
          delete state.updatingCommentIds[commentId];
          state.updateCommentErrorById[commentId] = action.error.message;
        },
      }
    ),

    deleteComment: create.asyncThunk(
      async ({
        taskId,
        commentId,
      }: {
        taskId: string;
        commentId: string;
      }) => {
        await commentsApi.deleteTaskComment(taskId, commentId);
        return { taskId, commentId };
      },
      {
        pending: (state, action) => {
          const { commentId } = action.meta.arg;
          state.deletingCommentIds[commentId] = true;
          state.deleteCommentErrorById[commentId] = undefined;
        },
        fulfilled: (state, action) => {
          const { taskId, commentId } = action.payload;

          delete state.deletingCommentIds[commentId];
          state.deleteCommentErrorById[commentId] = undefined;

          const filtered = ensureTaskComments(state, taskId).filter(
            (comment) => comment.id !== commentId
          );
          state.commentsByTask[taskId] = filtered;

          delete state.commentDetailsById[commentId];
          delete state.commentDetailsLoading[commentId];
          delete state.commentDetailsError[commentId];
        },
        rejected: (state, action) => {
          const { commentId } = action.meta.arg;
          delete state.deletingCommentIds[commentId];
          state.deleteCommentErrorById[commentId] = action.error.message;
        },
      }
    ),

    clearTaskComments: create.reducer((state, action: { payload: string }) => {
      const taskId = action.payload;
      delete state.commentsByTask[taskId];
      delete state.commentsLoading[taskId];
      delete state.commentsLoaded[taskId];
      delete state.commentsError[taskId];
      delete state.creatingCommentByTask[taskId];
      delete state.createCommentErrorByTask[taskId];
    }),
  }),

  selectors: {
    selectCommentsByTask: (state, taskId: string): TaskComment[] =>
      state.commentsByTask[taskId] ?? [],

    selectCommentsLoadingByTask: (state, taskId: string): boolean =>
      Boolean(state.commentsLoading[taskId]),

    selectCommentsLoadedByTask: (state, taskId: string): boolean =>
      Boolean(state.commentsLoaded[taskId]),

    selectCommentsErrorByTask: (state, taskId: string): string | undefined =>
      state.commentsError[taskId],

    selectCreatingCommentByTask: (state, taskId: string): boolean =>
      Boolean(state.creatingCommentByTask[taskId]),

    selectCreateCommentErrorByTask: (state, taskId: string): string | undefined =>
      state.createCommentErrorByTask[taskId],

    selectUpdatingCommentIds: (state): Record<string, boolean> =>
      state.updatingCommentIds,

    selectUpdateCommentErrors: (state): Record<string, string | undefined> =>
      state.updateCommentErrorById,

    selectUpdateCommentErrorById: (state, commentId: string): string | undefined =>
      state.updateCommentErrorById[commentId],

    selectDeletingCommentIds: (state): Record<string, boolean> =>
      state.deletingCommentIds,

    selectDeleteCommentErrors: (state): Record<string, string | undefined> =>
      state.deleteCommentErrorById,

    selectDeleteCommentErrorById: (state, commentId: string): string | undefined =>
      state.deleteCommentErrorById[commentId],

    selectCommentDetailsById: (state, commentId: string): TaskComment | undefined =>
      state.commentDetailsById[commentId],
  },
});

export const {
  getCommentsByTask,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  clearTaskComments,
} = taskCommentsSlice.actions;

export const {
  selectCommentsByTask,
  selectCommentsLoadingByTask,
  selectCommentsLoadedByTask,
  selectCommentsErrorByTask,
  selectCreatingCommentByTask,
  selectCreateCommentErrorByTask,
  selectUpdatingCommentIds,
  selectUpdateCommentErrors,
  selectUpdateCommentErrorById,
  selectDeletingCommentIds,
  selectDeleteCommentErrors,
  selectDeleteCommentErrorById,
  selectCommentDetailsById,
} = taskCommentsSlice.selectors;

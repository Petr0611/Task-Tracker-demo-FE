import { createAppSlice } from "../../../app/createAppSlice";
import type {
    Column,
    ColumnsSliceState,
    CreateColumnDto,
    CreateColumnInput,
    UpdateColumnDto,
} from "../types";
import * as api from "../services/api";
import { isAxiosError } from "axios";

const sanitizeOrderIndex = (value?: number): number | undefined => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (!Number.isFinite(value)) {
        return undefined;
    }

    const integerValue = Math.trunc(value);
    return integerValue < 0 ? 0 : integerValue;
};

const normalizeColumn = (column: Column): Column => ({
    ...column,
    orderIndex: Number.isFinite(column.orderIndex) ? column.orderIndex : 0,
    baseColumn: Boolean(column.baseColumn),
    tasks: Array.isArray(column.tasks) ? column.tasks : [],
});

const initialState: ColumnsSliceState = {
    columnsByProject: {},
    isLoading: false,
    error: undefined,
    isCreating: false,
    createColumnError: undefined,
    updatingColumnIds: {},
    updateColumnError: undefined,
    deletingColumnIds: {},
    deleteColumnError: undefined,
    columnDetailsById: {},
    columnDetailsLoading: {},
    columnDetailsError: {},
};

const mapToDto = (input: CreateColumnInput): CreateColumnDto => ({
    title: input.title.trim(),
    orderIndex: sanitizeOrderIndex(input.orderIndex),
    baseColumn: input.baseColumn,
});

export const columnsSlice = createAppSlice({
    name: "columns",
    initialState,
    reducers: (create) => ({
        getColumnsByProject: create.asyncThunk(
            async (projectId: string) => {
                const columns = await api.fetchColumnsByProject(projectId);
                return { projectId, columns };
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                    state.error = undefined;
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    const normalizedColumns = action.payload.columns.map(normalizeColumn);
                    state.columnsByProject[action.payload.projectId] = normalizedColumns;

                    normalizedColumns.forEach((column) => {
                        state.columnDetailsById[column.id] = column;
                        state.columnDetailsLoading[column.id] = false;
                        state.columnDetailsError[column.id] = undefined;
                    });
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.error = action.error.message;
                    const projectId = action.meta.arg;
                    state.columnsByProject[projectId] = [];
                },
            }
        ),

        createColumn: create.asyncThunk(
            async ({
                projectId,
                column,
            }: {
                projectId: string;
                column: CreateColumnInput;
            }) => {
                const payload: CreateColumnDto = mapToDto(column);
                const createdColumn = await api.createColumnForProject(projectId, payload);
                return createdColumn;
            },
            {
                pending: (state) => {
                    state.isCreating = true;
                    state.createColumnError = undefined;
                },
                fulfilled: (state, action) => {
                    state.isCreating = false;
                    state.createColumnError = undefined;
                    const newColumn = normalizeColumn(action.payload);
                    const projectColumns = state.columnsByProject[newColumn.projectId] ?? [];
                    state.columnsByProject[newColumn.projectId] = [
                        ...projectColumns,
                        newColumn,
                    ];
                    state.columnDetailsById[newColumn.id] = newColumn;
                    state.columnDetailsLoading[newColumn.id] = false;
                    state.columnDetailsError[newColumn.id] = undefined;
                },
                rejected: (state, action) => {
                    state.isCreating = false;
                    state.createColumnError = action.error.message;
                },
            }
        ),

        updateColumn: create.asyncThunk(
            async ({
                projectId,
                columnId,
                updates,
            }: {
                projectId: string;
                columnId: string;
                updates: UpdateColumnDto;
            }) => {
                void projectId;
                const sanitizedUpdates: UpdateColumnDto = {
                    ...updates,
                    title: updates.title?.trim(),
                    orderIndex: sanitizeOrderIndex(updates.orderIndex),
                    baseColumn: updates.baseColumn,
                };

                const updatedColumn = await api.updateColumnById(
                    columnId,
                    sanitizedUpdates
                );
                return updatedColumn;
            },
            {
                pending: (state, action) => {
                    const columnId = action.meta.arg.columnId;
                    state.updatingColumnIds[columnId] = true;
                    state.updateColumnError = undefined;
                },
                fulfilled: (state, action) => {
                    const updatedColumn = normalizeColumn(action.payload);
                    state.updatingColumnIds[updatedColumn.id] = false;
                    delete state.updatingColumnIds[updatedColumn.id];
                    state.updateColumnError = undefined;

                    const projectColumns =
                        state.columnsByProject[updatedColumn.projectId] ?? [];
                    const existingIndex = projectColumns.findIndex(
                        (column) => column.id === updatedColumn.id
                    );

                    if (existingIndex >= 0) {
                        projectColumns[existingIndex] = updatedColumn;
                    } else {
                        projectColumns.push(updatedColumn);
                    }

                    state.columnsByProject[updatedColumn.projectId] = projectColumns;
                    state.columnDetailsById[updatedColumn.id] = updatedColumn;
                    state.columnDetailsLoading[updatedColumn.id] = false;
                    state.columnDetailsError[updatedColumn.id] = undefined;
                },
                rejected: (state, action) => {
                    const columnId = action.meta.arg.columnId;
                    state.updatingColumnIds[columnId] = false;
                    delete state.updatingColumnIds[columnId];
                    state.updateColumnError = action.error.message;
                },
            }
        ),

        deleteColumn: create.asyncThunk(
            async (
                {
                    projectId,
                    columnId,
                }: {
                    projectId: string;
                    columnId: string;
                },
                { rejectWithValue }
            ) => {
                try {
                    await api.deleteColumnById(columnId);
                    return { projectId, columnId };
                } catch (error) {
                    if (isAxiosError(error)) {
                        const status = error.response?.status;
                        const responseData = error.response?.data as
                            | { message?: unknown }
                            | string
                            | undefined;
                        const responseMessage =
                            typeof responseData === "string"
                                ? responseData
                                : typeof responseData?.message === "string"
                                  ? responseData.message
                                  : undefined;

                        if (status === 400) {
                            return rejectWithValue(
                                responseMessage ??
                                    "Вы не можете удалить базовую колонку"
                            );
                        }

                        if (responseMessage) {
                            return rejectWithValue(responseMessage);
                        }
                    }

                    return rejectWithValue(
                        error instanceof Error
                            ? error.message
                            : "Не удалось удалить колонку"
                    );
                }
            },
            {
                pending: (state, action) => {
                    const columnId = action.meta.arg.columnId;
                    state.deletingColumnIds[columnId] = true;
                    state.deleteColumnError = undefined;
                },
                fulfilled: (state, action) => {
                    const { projectId, columnId } = action.payload;
                    state.deletingColumnIds[columnId] = false;
                    delete state.deletingColumnIds[columnId];
                    state.deleteColumnError = undefined;

                    const projectColumns = state.columnsByProject[projectId];
                    if (projectColumns) {
                        state.columnsByProject[projectId] = projectColumns.filter(
                            (column) => column.id !== columnId
                        );
                    }

                    delete state.columnDetailsById[columnId];
                    delete state.columnDetailsLoading[columnId];
                    delete state.columnDetailsError[columnId];
                },
                rejected: (state, action) => {
                    const columnId = action.meta.arg.columnId;
                    state.deletingColumnIds[columnId] = false;
                    delete state.deletingColumnIds[columnId];
                    const payloadMessage =
                        typeof action.payload === "string"
                            ? action.payload
                            : undefined;
                    state.deleteColumnError =
                        payloadMessage ??
                        action.error.message ??
                        "Не удалось удалить колонку";
                },
            }
        ),

        getColumnById: create.asyncThunk(
            async (columnId: string) => {
                const column = await api.fetchColumnById(columnId);
                return column;
            },
            {
                pending: (state, action) => {
                    const columnId = action.meta.arg;
                    state.columnDetailsLoading[columnId] = true;
                    state.columnDetailsError[columnId] = undefined;
                },
                fulfilled: (state, action) => {
                    const column = normalizeColumn(action.payload);
                    state.columnDetailsLoading[column.id] = false;
                    state.columnDetailsError[column.id] = undefined;
                    state.columnDetailsById[column.id] = column;

                    const projectColumns = state.columnsByProject[column.projectId] ?? [];
                    const existingIndex = projectColumns.findIndex(
                        (item) => item.id === column.id
                    );

                    if (existingIndex >= 0) {
                        projectColumns[existingIndex] = column;
                    } else {
                        projectColumns.push(column);
                    }

                    state.columnsByProject[column.projectId] = projectColumns;
                },
                rejected: (state, action) => {
                    const columnId = action.meta.arg;
                    state.columnDetailsLoading[columnId] = false;
                    state.columnDetailsError[columnId] = action.error.message;
                },
            }
        ),
    }),
    selectors: {
        selectColumnsByProject: (state, projectId: string): Column[] =>
            [...(state.columnsByProject[projectId] ?? [])].sort(
                (a, b) => a.orderIndex - b.orderIndex
            ),
        selectIsLoading: (state) => state.isLoading,
        selectError: (state) => state.error,
        selectIsCreating: (state) => state.isCreating,
        selectCreateColumnError: (state) => state.createColumnError,
        selectUpdatingColumnIds: (state) => state.updatingColumnIds,
        selectUpdateColumnError: (state) => state.updateColumnError,
        selectDeletingColumnIds: (state) => state.deletingColumnIds,
        selectDeleteColumnError: (state) => state.deleteColumnError,
        selectColumnDetailsById: (state, columnId: string): Column | undefined =>
            state.columnDetailsById[columnId],
        selectColumnDetailsLoadingById: (state, columnId: string): boolean =>
            Boolean(state.columnDetailsLoading[columnId]),
        selectColumnDetailsErrorById: (
            state,
            columnId: string
        ): string | undefined => state.columnDetailsError[columnId],
    },
});

export const {
    getColumnsByProject,
    createColumn,
    updateColumn,
    deleteColumn,
    getColumnById,
} = columnsSlice.actions;

export const {
    selectColumnsByProject,
    selectIsLoading: selectColumnsIsLoading,
    selectError: selectColumnsError,
    selectIsCreating: selectIsCreatingColumn,
    selectCreateColumnError,
    selectUpdatingColumnIds,
    selectUpdateColumnError,
    selectDeletingColumnIds,
    selectDeleteColumnError,
    selectColumnDetailsById,
    selectColumnDetailsLoadingById,
    selectColumnDetailsErrorById,
} = columnsSlice.selectors;
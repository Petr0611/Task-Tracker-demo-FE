import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    clearTasksForColumn,
    createTask,
    deleteTask,
    selectCreateTaskError,
    selectDeleteTaskError,
    selectDeletingTaskIds,
    selectIsCreatingTask,
    selectUpdateTaskError,
    selectUpdatingTaskIds,
    updateTask,
} from "../../tasks/slice/tasksSlice";
import TaskCard from "../../tasks/components/TaskCard";
import TaskCreateForm from "../../tasks/components/TaskCreateForm";
import {
    deleteColumn,
    getColumnById,
    selectColumnDetailsById,
    selectColumnDetailsErrorById,
    selectColumnDetailsLoadingById,
    selectDeleteColumnError,
    selectDeletingColumnIds,
    selectUpdateColumnError,
    selectUpdatingColumnIds,
    updateColumn,
} from "../slice/columnsSlice";
import type { Column } from "../types";
import type { Task, UpdateTaskDto } from "../../tasks/types";
import ColumnForm from "./ColumnForm";

interface ColumnCardProps {
    column: Column;
    projectId: string;
    allColumns: Column[];
    tasks: Task[];
    tasksLoading: boolean;
    tasksError?: string;
}

export default function ColumnCard({
    column,
    projectId,
    allColumns,
    tasks,
    tasksLoading,
    tasksError,
}: ColumnCardProps) {
    const dispatch = useAppDispatch();
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [isEditingColumn, setIsEditingColumn] = useState(false);

    const sortedTasks = useMemo(
        () =>
            [...tasks].sort(
                (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
            ),
        [tasks]
    );

    const isCreatingTask = useAppSelector(selectIsCreatingTask);
    const createTaskError = useAppSelector(selectCreateTaskError);
    const updateTaskError = useAppSelector(selectUpdateTaskError);
    const deleteTaskError = useAppSelector(selectDeleteTaskError);
    const updatingTaskIds = useAppSelector(selectUpdatingTaskIds);
    const deletingTaskIds = useAppSelector(selectDeletingTaskIds);

    const updatingColumnIds = useAppSelector(selectUpdatingColumnIds);
    const updateColumnError = useAppSelector(selectUpdateColumnError);
    const deletingColumnIds = useAppSelector(selectDeletingColumnIds);
    const deleteColumnError = useAppSelector(selectDeleteColumnError);
    const columnDetails = useAppSelector((state) =>
        selectColumnDetailsById(state, column.id)
    );
    const columnDetailsLoading = useAppSelector((state) =>
        selectColumnDetailsLoadingById(state, column.id)
    );
    const columnDetailsError = useAppSelector((state) =>
        selectColumnDetailsErrorById(state, column.id)
    );

    const isUpdatingColumn = Boolean(updatingColumnIds[column.id]);
    const isDeletingColumn = Boolean(deletingColumnIds[column.id]);

    useEffect(() => {
        if (isEditingColumn) {
            void dispatch(getColumnById(column.id));
        }
    }, [dispatch, isEditingColumn, column.id]);

    const columnFormInitialValues = useMemo(
        () => ({
            title: columnDetails?.title ?? column.title,
            orderIndex: columnDetails?.orderIndex ?? column.orderIndex,
        }),
        [columnDetails, column.orderIndex, column.title]
    );

    const handleCreateTaskSubmit = async ({
        columnId,
        title,
        description,
        status,
        priority,
        dueDate,
    }: {
        columnId: string;
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
    }) => {
        try {
            await dispatch(
                createTask({
                    projectId,
                    task: { columnId, title, description, status, priority, dueDate },
                })
            ).unwrap();
            setShowTaskForm(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateTask = async (taskId: string, updates: UpdateTaskDto) => {
        try {
            await dispatch(updateTask({ projectId, taskId, updates })).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await dispatch(deleteTask({ projectId, taskId })).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitColumn = async ({
        title,
        orderIndex,
    }: {
        title: string;
        orderIndex?: number;
    }) => {
        try {
            await dispatch(
                updateColumn({
                    projectId,
                    columnId: column.id,
                    updates: { title, orderIndex },
                })
            ).unwrap();
            setIsEditingColumn(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteColumn = async () => {
        const hasTasks = column.tasks && column.tasks.length > 0;

        const confirmMessage = hasTasks
            ? "Удалить колонку вместе со связанными задачами?"
            : "Удалить колонку?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await dispatch(deleteColumn({ projectId, columnId: column.id })).unwrap();
            dispatch(clearTasksForColumn(column.id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900">{column.title}</h2>
                    <p className="text-xs text-gray-500">
                        Порядок: {Number.isFinite(column.orderIndex) ? column.orderIndex : "—"}
                        {" · "}
                        Задач: {sortedTasks.length}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowTaskForm((prev) => !prev)}
                        className="inline-flex items-center rounded-md bg-black px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        disabled={isCreatingTask || isDeletingColumn || isUpdatingColumn}
                    >
                        {showTaskForm ? "Скрыть форму" : "Добавить задачу"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditingColumn(true)}
                        className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        disabled={isUpdatingColumn || isDeletingColumn}
                    >
                        Редактировать колонку
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteColumn}
                        className="inline-flex items-center rounded-md bg-red-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        disabled={isDeletingColumn}
                    >
                        {isDeletingColumn ? "Удаляем..." : "Удалить колонку"}
                    </button>
                </div>
            </header>

            {deleteColumnError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {deleteColumnError}
                </div>
            )}

            {isEditingColumn && (
                <div className="space-y-3">
                    {columnDetailsLoading && (
                        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                            Загружаем актуальные данные колонки...
                        </div>
                    )}

                    {columnDetailsError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {columnDetailsError}
                        </div>
                    )}

                    <ColumnForm
                        initialValues={columnFormInitialValues}
                        submitLabel={isUpdatingColumn ? "Сохраняем..." : "Сохранить"}
                        onSubmit={handleSubmitColumn}
                        onCancel={() => setIsEditingColumn(false)}
                        isSubmitting={isUpdatingColumn}
                        error={updateColumnError}
                        showCancelButton
                    />
                </div>
            )}

            {showTaskForm && (
                <TaskCreateForm
                    columns={allColumns}
                    defaultColumnId={column.id}
                    lockColumnSelection
                    onSubmit={handleCreateTaskSubmit}
                    onCancel={() => setShowTaskForm(false)}
                    isSubmitting={isCreatingTask}
                    error={createTaskError}
                />
            )}

            {tasksError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {tasksError}
                </div>
            )}

            {tasksLoading && (
                <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                    Загружаем задачи для этой колонки...
                </div>
            )}

            {!tasksLoading && tasks.length === 0 && !showTaskForm && (
                <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                    В колонке пока нет задач. Нажмите «Добавить задачу», чтобы создать первую.
                </div>
            )}

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
                {sortedTasks.map((taskItem) => (
                    <TaskCard
                        key={taskItem.id}
                        task={taskItem}
                        columns={allColumns}
                        isUpdating={Boolean(updatingTaskIds[taskItem.id])}
                        isDeleting={Boolean(deletingTaskIds[taskItem.id])}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                    />
                ))}
            </div>
        </section>
    );
}
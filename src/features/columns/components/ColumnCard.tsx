import {
    Fragment,
    type DragEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    clearTasksForColumn,
    createTask,
    deleteTask,
    moveTask,
    selectCreateTaskError,
    selectDeleteTaskError,
    selectDeletingTaskIds,
    selectIsCreatingTask,
    selectMoveTaskError,
    selectMovingTaskIds,
    selectUpdateTaskError,
    selectUpdatingTaskIds,
    uploadTaskAttachment,
    deleteTaskAttachment,
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
    onOpenTaskComments: (task: Task) => void;
    selectedTaskIds: string[];
    onToggleTaskSelection: (taskId: string) => void;
    selectionDisabled?: boolean;
}

export default function ColumnCard({
    column,
    projectId,
    allColumns,
    tasks,
    tasksLoading,
    tasksError,
    onOpenTaskComments,
    selectedTaskIds,
    onToggleTaskSelection,
    selectionDisabled = false,
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
    const selectedTaskIdsSet = useMemo(
        () => new Set(selectedTaskIds),
        [selectedTaskIds]
    );

    const isCreatingTask = useAppSelector(selectIsCreatingTask);
    const createTaskError = useAppSelector(selectCreateTaskError);
    const updateTaskError = useAppSelector(selectUpdateTaskError);
    const deleteTaskError = useAppSelector(selectDeleteTaskError);
    const updatingTaskIds = useAppSelector(selectUpdatingTaskIds);
    const deletingTaskIds = useAppSelector(selectDeletingTaskIds);
    const movingTaskIds = useAppSelector(selectMovingTaskIds);
    const moveTaskError = useAppSelector(selectMoveTaskError);

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
    const [activeDropZone, setActiveDropZone] = useState<number | null>(null);

    useEffect(() => {
        if (isEditingColumn) {
            void dispatch(getColumnById(column.id));
        }
    }, [dispatch, isEditingColumn, column.id]);

    const columnFormInitialValues = useMemo(
        () => ({
            title: columnDetails?.title ?? column.title,
            orderIndex: columnDetails?.orderIndex ?? column.orderIndex,
            baseColumn: columnDetails?.baseColumn ?? column.baseColumn,
        }),
        [columnDetails, column.baseColumn, column.orderIndex, column.title]
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
const handleUploadAttachment = async (taskId: string, file: File) => {
        try {
            await dispatch(uploadTaskAttachment({ taskId, file })).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAttachment = async (
        taskId: string,
        attachmentId: string
    ) => {
        try {
            await dispatch(
                deleteTaskAttachment({ taskId, attachmentId })
            ).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragStart = (event: DragEvent<HTMLDivElement>, taskId: string) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
            "application/json",
            JSON.stringify({ taskId, sourceColumnId: column.id })
        );
        event.dataTransfer.setData("text/plain", taskId);
    };

    const handleDragOverZone = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleDragEnterZone = (index: number) => {
        setActiveDropZone(index);
    };

    const handleDragLeaveZone = (index: number) => {
        setActiveDropZone((prev) => (prev === index ? null : prev));
    };

    const handleDragEnd = () => {
        setActiveDropZone(null);
    };

    const handleDropOnZone = async (
        event: DragEvent<HTMLDivElement>,
        targetIndex: number
    ) => {
        event.preventDefault();
        event.stopPropagation();
        setActiveDropZone(null);

        const dataTransfer = event.dataTransfer;
        const rawData = dataTransfer.getData("application/json");

        if (!rawData) {
            return;
        }

        try {
            const { taskId, sourceColumnId } = JSON.parse(rawData) as {
                taskId?: string;
                sourceColumnId?: string;
            };

            if (!taskId || !sourceColumnId) {
                return;
            }

            if (
                movingTaskIds[taskId] ||
                updatingTaskIds[taskId] ||
                deletingTaskIds[taskId]
            ) {
                return;
            }

            let desiredIndex = Math.max(
                0,
                Math.min(targetIndex, sortedTasks.length)
            );

            if (sourceColumnId === column.id) {
                const currentIndex = sortedTasks.findIndex(
                    (taskItem) => taskItem.id === taskId
                );

                if (currentIndex === -1) {
                    return;
                }

                if (desiredIndex > currentIndex) {
                    desiredIndex -= 1;
                }

                if (desiredIndex === currentIndex) {
                    return;
                }
            }

            await dispatch(
                moveTask({
                    taskId,
                    sourceColumnId,
                    destinationColumnId: column.id,
                    orderIndex: desiredIndex,
                })
            ).unwrap();
            dataTransfer.clearData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitColumn = async ({
        title,
        orderIndex,
        baseColumn,
    }: {
        title: string;
        orderIndex?: number;
        baseColumn?: boolean;
    }) => {
        try {
            await dispatch(
                updateColumn({
                    projectId,
                    columnId: column.id,
                    updates: { title, orderIndex, baseColumn },
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

    const DropZone = ({
        index,
        isInitial = false,
    }: {
        index: number;
        isInitial?: boolean;
    }) => (
        <div
            onDragOver={handleDragOverZone}
            onDragEnter={() => handleDragEnterZone(index)}
            onDragLeave={() => handleDragLeaveZone(index)}
            onDrop={(event) => handleDropOnZone(event, index)}
            className={clsx(
                "my-1 rounded-md transition-all duration-200",
                activeDropZone === index
                    ? "h-10 opacity-100 border-2 border-dashed border-black/40 bg-black/5"
                    : isInitial
                      ? "h-10 border-2 border-dashed border-gray-200/70 opacity-60"
                      : "h-2 opacity-0"
            )}
        />
    );

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
                        projectId={projectId}
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
                <div
                    className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600"
                    onDragOver={handleDragOverZone}
                    onDragEnter={() => handleDragEnterZone(0)}
                    onDragLeave={() => handleDragLeaveZone(0)}
                    onDrop={(event) => handleDropOnZone(event, 0)}
                >
                    В колонке пока нет задач. Нажмите «Добавить задачу», чтобы создать первую.
                </div>
            )}

            {(updateTaskError || deleteTaskError || moveTaskError) && (
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
                    {moveTaskError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {moveTaskError}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col">
                <DropZone index={0} isInitial={sortedTasks.length === 0} />
                {sortedTasks.map((taskItem, index) => {
                    const isUpdatingTask = Boolean(updatingTaskIds[taskItem.id]);
                    const isDeletingTask = Boolean(deletingTaskIds[taskItem.id]);
                    const isMovingTask = Boolean(movingTaskIds[taskItem.id]);
                    const isTaskBusy =
                        isUpdatingTask || isDeletingTask || isMovingTask;

                    return (
                        <Fragment key={taskItem.id}>
                            <div
                                className={clsx(
                                    "mb-3",
                                    isTaskBusy
                                        ? "cursor-not-allowed opacity-60"
                                        : "cursor-move"
                                )}
                                draggable={!isTaskBusy}
                                onDragStart={(event) =>
                                    handleDragStart(event, taskItem.id)
                                }
                                onDragEnd={handleDragEnd}
                            >
                                <TaskCard
                                    task={taskItem}
                                    isUpdating={isUpdatingTask}
                                    isDeleting={isDeletingTask}
                                    isMoving={isMovingTask}
                                    onUpdateTask={handleUpdateTask}
                                    onDeleteTask={handleDeleteTask}
                                    onUploadAttachment={handleUploadAttachment}
                                    onDeleteAttachment={handleDeleteAttachment}
                                    onOpenComments={() =>
                                        onOpenTaskComments(taskItem)
                                    }
                                    isSelected={selectedTaskIdsSet.has(
                                        taskItem.id
                                    )}
                                    onToggleSelection={() =>
                                        onToggleTaskSelection(taskItem.id)
                                    }
                                    selectionDisabled={
                                        isTaskBusy || selectionDisabled
                                    }
                                />
                            </div>
                            <DropZone index={index + 1} />
                        </Fragment>
                    );
                })}
            </div>
        </section>
    );
}
import {
    Fragment,
    type DragEvent,
    useEffect,
    useMemo,
    useRef,
    type SVGProps,
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
import "../../../css/ColumnCard.css";

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
    const [showColumnActionsMenu, setShowColumnActionsMenu] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement | null>(null);

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

    const handleToggleColumnActionsMenu = () => {
        if (isUpdatingColumn || isDeletingColumn) {
            return;
        }

        setShowColumnActionsMenu((prev) => !prev);
    };

    const handleStartEditColumn = () => {
        if (isUpdatingColumn || isDeletingColumn) {
            return;
        }

        setShowColumnActionsMenu(false);
        setIsEditingColumn(true);
    };

    const handleDeleteColumn = async () => {
        const hasTasks = column.tasks && column.tasks.length > 0;

        const confirmMessage = hasTasks
            ? "Delete this column along with its tasks?"
            : "Delete this column?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setShowColumnActionsMenu(false);
            await dispatch(deleteColumn({ projectId, columnId: column.id })).unwrap();
            dispatch(clearTasksForColumn(column.id));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!showColumnActionsMenu) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (!actionsMenuRef.current) {
                return;
            }

            const target = event.target as Node | null;

            if (target && actionsMenuRef.current.contains(target)) {
                return;
            }

            setShowColumnActionsMenu(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowColumnActionsMenu(false);
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showColumnActionsMenu]);

    useEffect(() => {
        if (!isUpdatingColumn && !isDeletingColumn) {
            return;
        }

        setShowColumnActionsMenu(false);
    }, [isUpdatingColumn, isDeletingColumn]);

    useEffect(() => {
        if (!isEditingColumn) {
            return;
        }

        setShowColumnActionsMenu(false);
    }, [isEditingColumn]);

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
                "column-card__drop-zone",
                isInitial
                    ? "column-card__drop-zone--initial"
                    : "column-card__drop-zone--compact",
                {
                    "column-card__drop-zone--active":
                        activeDropZone === index,
                }
            )}
        />
    );

    return (
        <section className="column-card">
            <header className="column-card__header">
                <div className="column-card__heading-group">
                    <h2 className="column-card__title">{column.title}</h2>
                    <p className="column-card__meta">
                        Order: {Number.isFinite(column.orderIndex) ? column.orderIndex : "—"}
                        {" · "}
                        Tasks: {sortedTasks.length}
                    </p>
                </div>

                <div className="column-card__actions">
                    <button
                        type="button"
                        onClick={() => setShowTaskForm((prev) => !prev)}
                        className={clsx(
                            "column-card__button",
                            "column-card__button--primary"
                        )} disabled={isCreatingTask || isDeletingColumn || isUpdatingColumn}
                    >
                        {showTaskForm ? "Hide form" : "Add task"}
                    </button>
                    <div className="column-card__actions-menu">
                        <button
                            type="button"
                            onClick={handleToggleColumnActionsMenu}
                            className="column-card__actions-trigger"
                            aria-haspopup="menu"
                            aria-expanded={showColumnActionsMenu}
                            aria-controls={`column-actions-${column.id}`}
                            disabled={isUpdatingColumn || isDeletingColumn}
                            aria-label="Additional column actions"
                        >
                            <EllipsisVerticalIcon className="column-card__actions-trigger-icon" aria-hidden="true" />
                        </button>
                        {showColumnActionsMenu && (
                            <div
                                ref={actionsMenuRef}
                                id={`column-actions-${column.id}`}
                                role="menu"
                                aria-orientation="vertical"
                                className="column-card__actions-popover"
                            >
                                <button
                                    type="button"
                                    onClick={handleStartEditColumn}
                                    className="column-card__actions-item"
                                    role="menuitem"
                                >
                                    <PencilIcon className="column-card__actions-item-icon" aria-hidden="true" />
                                    Edit column
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteColumn}
                                    className="column-card__actions-item column-card__actions-item--danger"
                                    role="menuitem"
                                >
                                    <TrashIcon className="column-card__actions-item-icon" aria-hidden="true" />
                                    {isDeletingColumn ? "Deleting..." : "Delete column"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {deleteColumnError && (
                <div className="column-card__alert column-card__alert--error">
                    {deleteColumnError}
                </div>
            )}

            {isEditingColumn && (
                <div className="column-card__edit-section">
                    {columnDetailsLoading && (
                        <div className="column-card__alert column-card__alert--info column-card__alert--dashed">                           
                         Loading the latest column data...
                        </div>
                    )}

                    {columnDetailsError && (
                        <div className="column-card__alert column-card__alert--error">
                            {columnDetailsError}
                        </div>
                    )}

                    <ColumnForm
                        initialValues={columnFormInitialValues}
                        submitLabel={isUpdatingColumn ? "Saving..." : "Save"}
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
                <div className="column-card__task-form">
                    <TaskCreateForm
                        columns={allColumns}
                        defaultColumnId={column.id}
                        lockColumnSelection
                        onSubmit={handleCreateTaskSubmit}
                        onCancel={() => setShowTaskForm(false)}
                        isSubmitting={isCreatingTask}
                        error={createTaskError}
                    />
                </div>
            )}

            {tasksError && (
                <div className="column-card__alert column-card__alert--error">
                    {tasksError}
                </div>
            )}

            {tasksLoading && (
                <div className="column-card__alert column-card__alert--info column-card__alert--dashed">
                    Loading tasks for this column...
                </div>
            )}

            {!tasksLoading && tasks.length === 0 && !showTaskForm && (
                <div
                    className="column-card__empty-state"
                    onDragOver={handleDragOverZone}
                    onDragEnter={() => handleDragEnterZone(0)}
                    onDragLeave={() => handleDragLeaveZone(0)}
                    onDrop={(event) => handleDropOnZone(event, 0)}
                >
                    This column doesn't have any tasks yet. Click "Add task" to create the first one.
                </div>
            )}

            {(updateTaskError || deleteTaskError || moveTaskError) && (
                <div className="column-card__alert-stack">
                    {updateTaskError && (
                        <div className="column-card__alert column-card__alert--error">
                            {updateTaskError}
                        </div>
                    )}
                    {deleteTaskError && (
                        <div className="column-card__alert column-card__alert--error">
                            {deleteTaskError}
                        </div>
                    )}
                    {moveTaskError && (
                        <div className="column-card__alert column-card__alert--error">
                            {moveTaskError}
                        </div>
                    )}
                </div>
            )}

            <div className="column-card__tasks">
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
                                    "column-card__task-wrapper",
                                    {
                                        "column-card__task-wrapper--busy":
                                            isTaskBusy,
                                        "column-card__task-wrapper--draggable":
                                            !isTaskBusy,
                                    }
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
                d="M16.862 4.487l1.651-1.65a1.5 1.5 0 112.122 2.122l-9.193 9.193a3 3 0 01-1.061.707l-3.11 1.037a.75.75 0 01-.948-.948l1.037-3.11a3 3 0 01.707-1.06l6.898-6.9"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 11.25V19.5a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 014.5 19.5v-12A1.5 1.5 0 016 6h8.25"
            />
        </svg>
    );
}

function TrashIcon(props: SVGProps<SVGSVGElement>) {
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
                d="M9.5 4.5h5a1 1 0 011 1V7h4.25M4.25 7H20.5M6.5 7v12a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5V7"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 11.5v6m4-6v6"
            />
        </svg>
    );
}
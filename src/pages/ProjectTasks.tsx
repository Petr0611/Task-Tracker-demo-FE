import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllProjects,
  selectProjects,
} from "../features/projects/slice/projectsSlice";
import ColumnForm from "../features/columns/components/ColumnForm";
import ColumnCard from "../features/columns/components/ColumnCard";
import ColumnTemplatesManager from "../features/columns/components/ColumnTemplatesManager";
import {
  createColumn,
  getColumnsByProject,
  selectColumnsByProject,
  selectColumnsError,
  selectColumnsIsLoading,
  selectCreateColumnError,
  selectIsCreatingColumn,
} from "../features/columns/slice/columnsSlice";
import {
  getTasksByColumn,
  getTasksByProject,
  bulkMoveTasks,
  bulkUpdateTaskStatus,
  selectColumnTasksError,
  selectColumnTasksLoaded,
  selectColumnTasksLoading,
  selectTasksByColumn,
  selectTasksError,
  selectTasksIsLoading,
  selectTaskDetailsById,
  selectIsBulkUpdatingStatus,
  selectBulkUpdateStatusError,
  selectIsBulkMovingTasks,
  selectBulkMoveTasksError,
} from "../features/tasks/slice/tasksSlice";
import type { CreateColumnInput } from "../features/columns/types";
import RoleUIBlock from "../features/projects/components/RoleUIBlock";
import type { Task } from "../features/tasks/types";
import TaskCommentsModal from "../features/tasks/components/TaskCommentsModal";
import { normalizeDueDate } from "../features/tasks/utils/formatDueDate";

const TASK_STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершена" },
  { value: "BLOCKED", label: "Заблокирована" },
];

const BULK_STATUS_OPTIONS = TASK_STATUS_OPTIONS.filter(
  (option) => option.value
);


const SORT_OPTIONS = [
  { value: "", label: "Без сортировки" },
  { value: "dueDate", label: "По дедлайну" },
  { value: "createdAt", label: "По дате создания" },
  { value: "priority", label: "По приоритету" },
  { value: "status", label: "По статусу" },
];

export default function ProjectTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const projects = useAppSelector(selectProjects);
  const columns = useAppSelector((state) =>
    projectId ? selectColumnsByProject(state, projectId) : []
  );
  const isLoadingColumns = useAppSelector(selectColumnsIsLoading);
  const columnsError = useAppSelector(selectColumnsError);
  const isCreatingColumn = useAppSelector(selectIsCreatingColumn);
  const createColumnError = useAppSelector(selectCreateColumnError);
  const isLoadingProjectTasks = useAppSelector(selectTasksIsLoading);
  const projectTasksError = useAppSelector(selectTasksError);
  const isBulkUpdatingStatus = useAppSelector(selectIsBulkUpdatingStatus);
  const bulkUpdateStatusError = useAppSelector(selectBulkUpdateStatusError);
  const isBulkMovingTasks = useAppSelector(selectIsBulkMovingTasks);
  const bulkMoveTasksError = useAppSelector(selectBulkMoveTasksError);

  const columnIds = columns.map((c) => c.id);

  const columnTasksData = useAppSelector((state) => {
    const result: {
      tasksByColumn: Record<string, ReturnType<typeof selectTasksByColumn>>;
      columnTasksLoading: Record<string, boolean>;
      columnTasksError: Record<string, string | undefined>;
      columnTasksLoaded: Record<string, boolean>;
    } = {
      tasksByColumn: {},
      columnTasksLoading: {},
      columnTasksError: {},
      columnTasksLoaded: {},
    };

    for (const columnId of columnIds) {
      result.tasksByColumn[columnId] = selectTasksByColumn(state, columnId);
      result.columnTasksLoading[columnId] = selectColumnTasksLoading(
        state,
        columnId
      );
      result.columnTasksError[columnId] = selectColumnTasksError(
        state,
        columnId
      );
      result.columnTasksLoaded[columnId] = selectColumnTasksLoaded(
        state,
        columnId
      );
    }

    return result;
  });

  const [showCreateColumnForm, setShowCreateColumnForm] = useState(
    () => columns.length === 0
  );
  const [activeTaskForComments, setActiveTaskForComments] =
    useState<Task | null>(null);

  const [taskFilters, setTaskFilters] = useState({
    status: "",
    executorId: "",
    dueBefore: "",
    sortBy: "",
  });

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkMoveColumnId, setBulkMoveColumnId] = useState("");
  const [bulkStatusLocalError, setBulkStatusLocalError] = useState<
    string | undefined
  >(undefined);
  const [bulkMoveLocalError, setBulkMoveLocalError] = useState<
    string | undefined
  >(undefined);

  const sanitizedFilters = useMemo(() => {
    const dueBefore = taskFilters.dueBefore
      ? normalizeDueDate(taskFilters.dueBefore)
      : undefined;

    const executorId = taskFilters.executorId.trim()
      ? taskFilters.executorId.trim()
      : undefined;

    return {
      status: taskFilters.status || undefined,
      executorId,
      dueBefore,
      sortBy: taskFilters.sortBy || undefined,
    };
  }, [taskFilters]);

  const hasActiveFilters = Boolean(
    sanitizedFilters.status ||
    sanitizedFilters.executorId ||
    sanitizedFilters.dueBefore ||
    sanitizedFilters.sortBy
  );

 
  const hasSelectedTasks = selectedTaskIds.length > 0;
  const isAnyBulkActionLoading = isBulkUpdatingStatus || isBulkMovingTasks;

  const activeTaskFromStore = useAppSelector((state) => {
    if (!activeTaskForComments) {
      return undefined;
    }
    return selectTaskDetailsById(state, activeTaskForComments.id);
  });

  const taskForComments = activeTaskFromStore ?? activeTaskForComments ?? undefined;

  const toggleTaskSelection = useCallback(
    (taskId: string) => {
      if (isAnyBulkActionLoading) {
        return;
      }

      setSelectedTaskIds((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      );
    },
    [isAnyBulkActionLoading]
  );

  const clearTaskSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);


  useEffect(() => {
    if (projects.length === 0) {
      dispatch(getAllProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) {
      dispatch(getColumnsByProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    void dispatch(
      getTasksByProject({
        projectId,
        filters: sanitizedFilters,
      })
    );
  }, [dispatch, projectId, sanitizedFilters]);

  useEffect(() => {
    if (!projectId || hasActiveFilters) return;

    for (const column of columns) {
      if (!columnTasksData.columnTasksLoaded[column.id]) {
        dispatch(getTasksByColumn({ projectId, columnId: column.id }));
      }
    }
  }, [
    dispatch,
    projectId,
    columns,
    columnTasksData.columnTasksLoaded,
    hasActiveFilters,
  ]);

   useEffect(() => {
    setSelectedTaskIds([]);
  }, [projectId, sanitizedFilters]);

  useEffect(() => {
    setBulkStatusLocalError(undefined);
  }, [bulkStatus, selectedTaskIds.length]);

  useEffect(() => {
    setBulkMoveLocalError(undefined);
  }, [bulkMoveColumnId, selectedTaskIds.length]);


  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId]
  );

  const handleCreateColumn = async (input: CreateColumnInput) => {
    if (!projectId) {
      return;
    }

    try {
      await dispatch(createColumn({ projectId, column: input })).unwrap();
      setShowCreateColumnForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTaskFiltersChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setTaskFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetTaskFilters = () => {
    setTaskFilters({ status: "", executorId: "", dueBefore: "", sortBy: "" });
  };

  const handleBulkStatusApply = async () => {
    if (!projectId) {
      return;
    }

    if (selectedTaskIds.length === 0) {
      setBulkStatusLocalError("Выберите задачи для обновления статуса");
      return;
    }

    const trimmedStatus = bulkStatus.trim();

    if (!trimmedStatus) {
      setBulkStatusLocalError("Выберите новый статус");
      return;
    }

    setBulkStatusLocalError(undefined);

    try {
      await dispatch(
        bulkUpdateTaskStatus({
          taskIds: selectedTaskIds,
          status: trimmedStatus,
        })
      ).unwrap();

      clearTaskSelection();
      setBulkStatus("");

      await dispatch(
        getTasksByProject({ projectId, filters: sanitizedFilters })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkMoveApply = async () => {
    if (!projectId) {
      return;
    }

    if (selectedTaskIds.length === 0) {
      setBulkMoveLocalError("Выберите задачи для перемещения");
      return;
    }

    const trimmedColumnId = bulkMoveColumnId.trim();

    if (!trimmedColumnId) {
      setBulkMoveLocalError("Выберите колонку назначения");
      return;
    }

    setBulkMoveLocalError(undefined);

    const targetColumnTasks =
      columnTasksData.tasksByColumn[trimmedColumnId] ?? [];
    const remainingTasks = targetColumnTasks.filter(
      (task) => !selectedTaskIds.includes(task.id)
    );

    const highestOrderIndex = remainingTasks.reduce((max, task) => {
      const orderIndex =
        typeof task.orderIndex === "number" && Number.isFinite(task.orderIndex)
          ? task.orderIndex
          : undefined;

      return orderIndex !== undefined ? Math.max(max, orderIndex) : max;
    }, -1);

    const startOrderIndex =
      highestOrderIndex >= 0 ? highestOrderIndex + 1 : remainingTasks.length;

    try {
      await dispatch(
        bulkMoveTasks({
          taskIds: selectedTaskIds,
          targetColumnId: trimmedColumnId,
          startOrderIndex,
        })
      ).unwrap();

      clearTaskSelection();
      setBulkMoveColumnId("");

      await dispatch(
        getTasksByProject({ projectId, filters: sanitizedFilters })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleTemplateApplied = useCallback(() => {
    if (!projectId) {
      return;
    }

    clearTaskSelection();
    dispatch(getColumnsByProject(projectId));
    void dispatch(
      getTasksByProject({
        projectId,
        filters: sanitizedFilters,
      })
    );
  }, [clearTaskSelection, dispatch, projectId, sanitizedFilters]);

  if (!projectId) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Не удалось определить проект. Вернитесь к списку проектов и выберите
          нужный снова.
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="mt-4 inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          К проектам
        </button>
      </div>
    );
  }

  const { tasksByColumn, columnTasksLoading, columnTasksError } =
    columnTasksData;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          ← Назад к проектам
        </button>

        <div className="text-right">
          <h1 className="text-2xl font-semibold text-gray-900">
            {project?.title || "Проект"}
          </h1>
          <p className="text-sm text-gray-500">
            {project?.description || "Управление задачами проекта"}
          </p>
        </div>
      </div>

      {projectId && <RoleUIBlock projectId={projectId} />}

      {(columnsError || projectTasksError) && (
        <div className="space-y-2">
          {columnsError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {columnsError}
            </div>
          )}
          {projectTasksError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {projectTasksError}
            </div>
          )}
        </div>
      )}

      {(isLoadingColumns || isLoadingProjectTasks) && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          Загружаем данные проекта...
        </div>
      )}

      <form
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Статус
            </label>
            <select
              id="status"
              name="status"
              value={taskFilters.status}
              onChange={handleTaskFiltersChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            >
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="executorId"
              className="block text-sm font-medium text-gray-700"
            >
              Исполнитель
            </label>
            <input
              id="executorId"
              name="executorId"
              type="text"
              value={taskFilters.executorId}
              onChange={handleTaskFiltersChange}
              placeholder="ID исполнителя"
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dueBefore"
              className="block text-sm font-medium text-gray-700"
            >
              Дедлайн до
            </label>
            <input
              id="dueBefore"
              name="dueBefore"
              type="datetime-local"
              value={taskFilters.dueBefore}
              onChange={handleTaskFiltersChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium text-gray-700"
            >
              Сортировка
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={taskFilters.sortBy}
              onChange={handleTaskFiltersChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <span className="self-center text-sm text-gray-500">
            {hasActiveFilters
              ? "Применены фильтры к списку задач"
              : "Показаны все задачи проекта"}
          </span>
          <button
            type="button"
            onClick={handleResetTaskFilters}
            disabled={!hasActiveFilters}
            className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Сбросить фильтры
          </button>
        </div>
      </form>

      {hasSelectedTasks && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Выбрано задач: {selectedTaskIds.length}
              </h2>
              <p className="text-xs text-amber-700">
                Выберите действие, которое нужно применить к выбранным задачам.
              </p>
            </div>
            <button
              type="button"
              onClick={clearTaskSelection}
              className="inline-flex items-center rounded-md border border-amber-300 px-3 py-2 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              disabled={isAnyBulkActionLoading}
            >
              Очистить выбор
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-amber-900">
                Изменить статус
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={bulkStatus}
                  onChange={(event) => setBulkStatus(event.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 sm:w-auto"
                  disabled={isBulkUpdatingStatus}
                >
                  <option value="">Выберите статус</option>
                  {BULK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkStatusApply}
                  className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  disabled={isBulkUpdatingStatus}
                >
                  {isBulkUpdatingStatus ? "Обновляем..." : "Применить"}
                </button>
              </div>
              {(bulkStatusLocalError || bulkUpdateStatusError) && (
                <p className="text-xs text-red-600">
                  {bulkStatusLocalError || bulkUpdateStatusError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-amber-900">
                Переместить в колонку
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={bulkMoveColumnId}
                  onChange={(event) => setBulkMoveColumnId(event.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 sm:w-auto"
                  disabled={isBulkMovingTasks}
                >
                  <option value="">Выберите колонку</option>
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkMoveApply}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  disabled={isBulkMovingTasks}
                >
                  {isBulkMovingTasks ? "Перемещаем..." : "Переместить"}
                </button>
              </div>
              {(bulkMoveLocalError || bulkMoveTasksError) && (
                <p className="text-xs text-red-600">
                  {bulkMoveLocalError || bulkMoveTasksError}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {projectId && (
        <ColumnTemplatesManager
          projectId={projectId}
          onTemplateApplied={handleTemplateApplied}
        />
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowCreateColumnForm((prev) => !prev)}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          {showCreateColumnForm ? "Скрыть форму колонки" : "Добавить колонку"}
        </button>

        {showCreateColumnForm && (
          <ColumnForm
            submitLabel={isCreatingColumn ? "Создаем..." : "Создать колонку"}
            onSubmit={handleCreateColumn}
            onCancel={() => setShowCreateColumnForm(false)}
            isSubmitting={isCreatingColumn}
            error={createColumnError}
            showCancelButton={columns.length > 0}
            title="Новая колонка"
            description="Укажите название и порядок отображения колонки"
            resetOnSubmit
            projectId={projectId}
          />
        )}
      </div>

      {!isLoadingColumns && columns.length === 0 && !showCreateColumnForm && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
          В этом проекте еще нет колонок. Создайте первую колонку, чтобы начать
          добавлять задачи.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {columns.map((column) => (
          <ColumnCard
            key={column.id}
            column={column}
            projectId={projectId}
            allColumns={columns}
            tasks={tasksByColumn[column.id] ?? []}
            tasksLoading={Boolean(columnTasksLoading[column.id])}
            tasksError={columnTasksError[column.id]}
            onOpenTaskComments={(task) => setActiveTaskForComments(task)}
            selectedTaskIds={selectedTaskIds}
            onToggleTaskSelection={toggleTaskSelection}
            selectionDisabled={isAnyBulkActionLoading}
          />
        ))}
      </div>
      {taskForComments && (
        <TaskCommentsModal
          task={taskForComments}
          isOpen={Boolean(taskForComments)}
          onClose={() => setActiveTaskForComments(null)}
        />
      )}
    </div>
  );
}

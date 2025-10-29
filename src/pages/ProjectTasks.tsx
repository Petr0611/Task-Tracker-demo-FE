import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllProjects,
  selectProjects,
} from "../features/projects/slice/projectsSlice";
import ColumnForm from "../features/columns/components/ColumnForm";
import ColumnCard from "../features/columns/components/ColumnCard";
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
  selectColumnTasksError,
  selectColumnTasksLoaded,
  selectColumnTasksLoading,
  selectTasksByColumn,
  selectTasksError,
  selectTasksIsLoading,
  selectTaskDetailsById,
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

  const activeTaskFromStore = useAppSelector((state) => {
    if (!activeTaskForComments) {
      return undefined;
    }
    return selectTaskDetailsById(state, activeTaskForComments.id);
  });

  const taskForComments = activeTaskFromStore ?? activeTaskForComments ?? undefined;

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

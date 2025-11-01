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
  selectColumnsIsLoading,
  selectCreateColumnError,
  selectIsCreatingColumn,
} from "../features/columns/slice/columnsSlice";
import {
  getTasksByProject,
  bulkMoveTasks,
  bulkUpdateTaskStatus,
  selectColumnTasksError,
  selectColumnTasksLoaded,
  selectColumnTasksLoading,
  selectTasksByColumn,
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
import {
  ArrowLeft,
  Filter,
  Settings,
  Layers,
  Plus,
  Wrench,
} from "lucide-react";
import "../css/ProjectTasks.css";

const TASK_STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершена" },
  { value: "BLOCKED", label: "Заблокирована" },
];

const BULK_STATUS_OPTIONS = TASK_STATUS_OPTIONS.filter((o) => o.value);

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
  const isCreatingColumn = useAppSelector(selectIsCreatingColumn);
  const createColumnError = useAppSelector(selectCreateColumnError);
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
      result.columnTasksError[columnId] = selectColumnTasksError(state, columnId);
      result.columnTasksLoaded[columnId] = selectColumnTasksLoaded(state, columnId);
    }
    return result;
  });

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
  const [bulkStatusLocalError, setBulkStatusLocalError] = useState<string>();
  const [bulkMoveLocalError, setBulkMoveLocalError] = useState<string>();

  const [openFilters, setOpenFilters] = useState(false);
  const [openBulkActions, setOpenBulkActions] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openCreateColumn, setOpenCreateColumn] = useState(columns.length === 0);
  const [openProjectManagement, setOpenProjectManagement] = useState(false);

  const handleToggleSection = (section: string) => {
    setOpenFilters((prev) => (section === "filters" ? !prev : false));
    setOpenBulkActions((prev) => (section === "bulk" ? !prev : false));
    setOpenTemplates((prev) => (section === "templates" ? !prev : false));
    setOpenCreateColumn((prev) => (section === "createColumn" ? !prev : false));
    setOpenProjectManagement((prev) => (section === "management" ? !prev : false));
  };

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

  const activeTaskFromStore = useAppSelector((state) =>
    activeTaskForComments
      ? selectTaskDetailsById(state, activeTaskForComments.id)
      : undefined
  );
  const taskForComments = activeTaskFromStore ?? activeTaskForComments ?? undefined;

  const toggleTaskSelection = useCallback(
    (taskId: string) => {
      if (isAnyBulkActionLoading) return;
      setSelectedTaskIds((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      );
    },
    [isAnyBulkActionLoading]
  );

  const clearTaskSelection = useCallback(() => setSelectedTaskIds([]), []);

  useEffect(() => {
    if (projects.length === 0) dispatch(getAllProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) dispatch(getColumnsByProject(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId)
      void dispatch(getTasksByProject({ projectId, filters: sanitizedFilters }));
  }, [dispatch, projectId, sanitizedFilters]);

  useEffect(() => setSelectedTaskIds([]), [projectId, sanitizedFilters]);
  useEffect(
    () => setBulkStatusLocalError(undefined),
    [bulkStatus, selectedTaskIds.length]
  );
  useEffect(
    () => setBulkMoveLocalError(undefined),
    [bulkMoveColumnId, selectedTaskIds.length]
  );

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const handleCreateColumn = async (input: CreateColumnInput) => {
    if (!projectId) return;
    try {
      await dispatch(createColumn({ projectId, column: input })).unwrap();
      setOpenCreateColumn(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTaskFiltersChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setTaskFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleResetTaskFilters = () =>
    setTaskFilters({ status: "", executorId: "", dueBefore: "", sortBy: "" });

  const handleBulkStatusApply = async () => {
    if (!projectId) return;
    if (!selectedTaskIds.length)
      return setBulkStatusLocalError("Выберите задачи для обновления");
    if (!bulkStatus.trim())
      return setBulkStatusLocalError("Выберите новый статус");
    setBulkStatusLocalError(undefined);
    try {
      await dispatch(
        bulkUpdateTaskStatus({ taskIds: selectedTaskIds, status: bulkStatus.trim() })
      ).unwrap();
      clearTaskSelection();
      setBulkStatus("");
      await dispatch(getTasksByProject({ projectId, filters: sanitizedFilters }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkMoveApply = async () => {
    if (!projectId) return;
    if (!selectedTaskIds.length)
      return setBulkMoveLocalError("Выберите задачи для перемещения");
    if (!bulkMoveColumnId.trim())
      return setBulkMoveLocalError("Выберите колонку назначения");
    setBulkMoveLocalError(undefined);

    const target = columnTasksData.tasksByColumn[bulkMoveColumnId] ?? [];
    const remaining = target.filter((t) => !selectedTaskIds.includes(t.id));
    const startIndex =
      Math.max(-1, ...remaining.map((t) => t.orderIndex ?? -1)) + 1;

    try {
      await dispatch(
        bulkMoveTasks({
          taskIds: selectedTaskIds,
          targetColumnId: bulkMoveColumnId.trim(),
          startOrderIndex: startIndex,
        })
      ).unwrap();
      clearTaskSelection();
      setBulkMoveColumnId("");
      await dispatch(getTasksByProject({ projectId, filters: sanitizedFilters }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateApplied = useCallback(() => {
    if (!projectId) return;
    clearTaskSelection();
    dispatch(getColumnsByProject(projectId));
    void dispatch(getTasksByProject({ projectId, filters: sanitizedFilters }));
  }, [clearTaskSelection, dispatch, projectId, sanitizedFilters]);

  if (!projectId)
    return (
      <div className="project-tasks-empty">
        <div className="project-tasks-alert project-tasks-alert--error">
          Не удалось определить проект.
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="project-tasks-button project-tasks-button--primary"
        >
          К проектам
        </button>
      </div>
    );

  const { tasksByColumn, columnTasksLoading, columnTasksError } = columnTasksData;

  return (
    <div className="project-tasks-page">
      <header className="project-tasks-header-full">
        <div className="project-tasks-header-top">
          <button
            onClick={() => navigate("/projects")}
            className="project-tasks-button project-tasks-button--secondary"
            title="Назад"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="project-tasks-header-info">
            <h1 className="project-tasks-title">{project?.title || "Проект"}</h1>
            <p className="project-tasks-subtitle">
              {project?.description || "Управление задачами"}
            </p>
          </div>
        </div>

        <div className="project-tasks-subheader">
          <button
            onClick={() => handleToggleSection("filters")}
            className="project-tasks-button project-tasks-button--ghost"
            title="Фильтры"
          >
            <Filter size={20} />
          </button>

          <button
            onClick={() => handleToggleSection("bulk")}
            className="project-tasks-button project-tasks-button--ghost"
            title="Массовые действия"
          >
            <Wrench size={20} />
          </button>

          <button
            onClick={() => handleToggleSection("templates")}
            className="project-tasks-button project-tasks-button--ghost"
            title="Шаблоны"
          >
            <Layers size={20} />
          </button>

          <button
            onClick={() => handleToggleSection("createColumn")}
            className="project-tasks-button project-tasks-button--primary"
            title="Добавить колонку"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={() => handleToggleSection("management")}
            className="project-tasks-button project-tasks-button--ghost"
            title="Project Management"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {openProjectManagement && projectId && (
        <div className="project-tasks-create">
          <RoleUIBlock projectId={projectId} />
        </div>
      )}

      {openFilters && (
        <form
          className="project-tasks-filters project-tasks-filters--in-header"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="project-tasks-filters-grid">
            <div className="project-tasks-field">
              <label className="project-tasks-label">Статус</label>
              <select
                name="status"
                value={taskFilters.status}
                onChange={handleTaskFiltersChange}
                className="project-tasks-input"
              >
                {TASK_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="project-tasks-field">
              <label className="project-tasks-label">Исполнитель</label>
              <input
                name="executorId"
                value={taskFilters.executorId}
                onChange={handleTaskFiltersChange}
                placeholder="ID исполнителя"
                className="project-tasks-input"
              />
            </div>
            <div className="project-tasks-field">
              <label className="project-tasks-label">Дедлайн до</label>
              <input
                name="dueBefore"
                type="datetime-local"
                value={taskFilters.dueBefore}
                onChange={handleTaskFiltersChange}
                className="project-tasks-input"
              />
            </div>
            <div className="project-tasks-field">
              <label className="project-tasks-label">Сортировка</label>
              <select
                name="sortBy"
                value={taskFilters.sortBy}
                onChange={handleTaskFiltersChange}
                className="project-tasks-input"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="project-tasks-filters-footer">
            <span className="project-tasks-selection-info">
              {hasActiveFilters ? "Фильтры активны" : "Все задачи"}
            </span>
            <button
              type="button"
              onClick={handleResetTaskFilters}
              className="project-tasks-button project-tasks-button--ghost"
              disabled={!hasActiveFilters}
            >
              Сбросить фильтры
            </button>
          </div>
        </form>
      )}

      {openBulkActions && (
        <section className="project-tasks-bulk-actions">
          <div className="project-tasks-bulk-header">
            <div>
              <h2 className="project-tasks-bulk-title">
                Выбрано задач: {selectedTaskIds.length}
              </h2>
              <p className="project-tasks-bulk-subtitle">
                {hasSelectedTasks
                  ? "Выберите действие."
                  : "Отметьте задачи чекбоксами."}
              </p>
            </div>
            <button
              onClick={clearTaskSelection}
              disabled={!hasSelectedTasks || isAnyBulkActionLoading}
              className="project-tasks-button project-tasks-button--outline"
            >
              Очистить выбор
            </button>
          </div>

          <div className="project-tasks-bulk-grid">
            <div className="project-tasks-field">
              <label className="project-tasks-label project-tasks-label--warm">
                Изменить статус
              </label>
              <div className="project-tasks-bulk-row">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  disabled={!hasSelectedTasks || isBulkUpdatingStatus}
                  className="project-tasks-input"
                >
                  <option value="">Выберите статус</option>
                  {BULK_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusApply}
                  disabled={!hasSelectedTasks || isBulkUpdatingStatus}
                  className="project-tasks-button project-tasks-button--primary"
                >
                  {isBulkUpdatingStatus ? "Применяем..." : "Применить"}
                </button>
              </div>
              {(bulkStatusLocalError || bulkUpdateStatusError) && (
                <p className="project-tasks-error-text">
                  {bulkStatusLocalError || bulkUpdateStatusError}
                </p>
              )}
            </div>

            <div className="project-tasks-field">
              <label className="project-tasks-label project-tasks-label--warm">
                Переместить в колонку
              </label>
              <div className="project-tasks-bulk-row">
                <select
                  value={bulkMoveColumnId}
                  onChange={(e) => setBulkMoveColumnId(e.target.value)}
                  disabled={!hasSelectedTasks || isBulkMovingTasks}
                  className="project-tasks-input"
                >
                  <option value="">Выберите колонку</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkMoveApply}
                  disabled={!hasSelectedTasks || isBulkMovingTasks}
                  className="project-tasks-button project-tasks-button--accent"
                >
                  {isBulkMovingTasks ? "Перемещаем..." : "Переместить"}
                </button>
              </div>
              {(bulkMoveLocalError || bulkMoveTasksError) && (
                <p className="project-tasks-error-text">
                  {bulkMoveLocalError || bulkMoveTasksError}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {openTemplates && projectId && (
        <ColumnTemplatesManager
          projectId={projectId}
          onTemplateApplied={handleTemplateApplied}
        />
      )}

      {openCreateColumn && (
        <div className="project-tasks-create">
          <ColumnForm
            submitLabel={isCreatingColumn ? "Создаем..." : "Создать колонку"}
            onSubmit={handleCreateColumn}
            onCancel={() => setOpenCreateColumn(false)}
            isSubmitting={isCreatingColumn}
            error={createColumnError}
            title="Новая колонка"
            description="Укажите название и порядок"
            resetOnSubmit
            projectId={projectId}
          />
        </div>
      )}

      {!isLoadingColumns && columns.length === 0 && !openCreateColumn ? (
        <div className="project-tasks-placeholder project-tasks-placeholder--centered">
          В этом проекте еще нет колонок. Нажмите «Добавить колонку».
        </div>
      ) : (
        <div className="project-tasks-columns">
          {columns.map((c) => (
            <ColumnCard
              key={c.id}
              column={c}
              projectId={projectId}
              allColumns={columns}
              tasks={tasksByColumn[c.id] ?? []}
              tasksLoading={!!columnTasksLoading[c.id]}
              tasksError={columnTasksError[c.id]}
              onOpenTaskComments={(t) => setActiveTaskForComments(t)}
              selectedTaskIds={selectedTaskIds}
              onToggleTaskSelection={toggleTaskSelection}
              selectionDisabled={isAnyBulkActionLoading}
            />
          ))}
        </div>
      )}

      {taskForComments && (
        <TaskCommentsModal
          task={taskForComments}
          isOpen
          onClose={() => setActiveTaskForComments(null)}
        />
      )}
    </div>
  );
}

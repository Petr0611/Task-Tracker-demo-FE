import { useEffect, useMemo, useState } from "react";
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
} from "../features/tasks/slice/tasksSlice";
import type { CreateColumnInput } from "../features/columns/types";
import RoleUIBlock from "../features/projects/components/RoleUIBlock";

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

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(getAllProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) {
      dispatch(getColumnsByProject(projectId));
      dispatch(getTasksByProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!projectId) return;

    for (const column of columns) {
      if (!columnTasksData.columnTasksLoaded[column.id]) {
        dispatch(getTasksByColumn({ projectId, columnId: column.id }));
      }
    }
  }, [dispatch, projectId, columns, columnTasksData.columnTasksLoaded]);

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
          />
        ))}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { Column } from "../../columns/types";
import {
  createTask,
  selectCreateTaskError,
  selectIsCreatingTask,
} from "../slice/tasksSlice";
import type { CreateTaskInput } from "../types";

interface TaskFormProps {
  projectId: string;
  columns: Column[];
  defaultColumnId?: string;
  lockColumnSelection?: boolean;
  onCancel?: () => void;
  showCancelButton?: boolean;
  onCreated?: () => void;
}

const validationSchema = Yup.object({
  columnId: Yup.string().trim().required("Выберите колонку"),
  title: Yup.string().trim().required("Введите название задачи"),
  description: Yup.string().optional(),
  status: Yup.string().optional(),
  priority: Yup.string().optional(),
  dueDate: Yup.string().optional(),
});

const createInitialValues = (defaultColumnId?: string) => ({
  columnId: defaultColumnId ?? "",
  title: "",
  description: "",
  status: "",
  priority: "",
  dueDate: "",
});

export default function TaskForm({
  projectId,
  columns,
  defaultColumnId,
  lockColumnSelection = false,
  onCancel,
  showCancelButton = false,
  onCreated,
}: TaskFormProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectIsCreatingTask);
  const createError = useAppSelector(selectCreateTaskError);

  const formik = useFormik({
    initialValues: createInitialValues(defaultColumnId ?? columns[0]?.id),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const sanitizedValues: CreateTaskInput = {
        columnId: values.columnId.trim(),
        title: values.title.trim(),
        description: values.description.trim()
          ? values.description.trim()
          : undefined,
        status: values.status.trim() ? values.status.trim() : undefined,
        priority: values.priority.trim() ? values.priority.trim() : undefined,
        dueDate: values.dueDate.trim() ? values.dueDate.trim() : undefined,
      };

      try {
        await dispatch(createTask({ projectId, task: sanitizedValues })).unwrap();
        resetForm({ values: createInitialValues(sanitizedValues.columnId) });
        onCreated?.();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!formik.values.columnId && columns.length > 0) {
      formik.setFieldValue("columnId", columns[0].id, false);
    }
  }, [columns, formik]);

  const titleHasError = Boolean(formik.touched.title && formik.errors.title);
  const columnHasError = Boolean(
    formik.touched.columnId && formik.errors.columnId
  );

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Новая задача</h1>
        <p className="text-sm text-gray-500">
          Заполните данные, чтобы добавить задачу в проект
        </p>
        {createError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {createError}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="columnId"
            className="block text-sm font-medium text-gray-700"
          >
            Колонка
          </label>
          <select
            id="columnId"
            name="columnId"
            value={formik.values.columnId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${columnHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
            disabled={formik.isSubmitting || isCreating || lockColumnSelection}
          >
            <option value="" disabled>
              Выберите колонку
            </option>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
          {columnHasError && (
            <p className="text-sm text-red-500">{formik.errors.columnId}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Название
          </label>
          <input
            id="title"
            type="text"
            {...formik.getFieldProps("title")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${titleHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
            placeholder="Например, Подготовить презентацию"
            disabled={formik.isSubmitting || isCreating}
          />
          {titleHasError && (
            <p className="text-sm text-red-500">{formik.errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Описание
          </label>
          <textarea
            id="description"
            rows={3}
            {...formik.getFieldProps("description")}
            className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Кратко опишите задачу"
            disabled={formik.isSubmitting || isCreating}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
            disabled={formik.isSubmitting || isCreating}
          >
            {formik.isSubmitting || isCreating ? "Создаем..." : "Создать задачу"}
          </button>

          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={formik.isSubmitting || isCreating}
            >
              Отменить
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

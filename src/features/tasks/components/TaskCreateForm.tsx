import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { Column } from "../../columns/types";
import type { CreateTaskInput } from "../types";
import { normalizeDueDate } from "../utils/formatDueDate";

interface TaskCreateFormProps {
    columns: Column[];
    defaultColumnId?: string;
    lockColumnSelection?: boolean;
    onSubmit: (values: CreateTaskInput) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    error?: string;
}

const validationSchema = Yup.object({
    columnId: Yup.string().trim().required("Выберите колонку"),
    title: Yup.string().trim().required("Введите название задачи"),
    description: Yup.string().optional(),
    status: Yup.string().optional(),
    priority: Yup.string().optional(),
    dueDate: Yup.string().optional(),
});

const sanitizeValues = (values: CreateTaskInput): CreateTaskInput => ({
    columnId: values.columnId.trim(),
    title: values.title.trim(),
    description: values.description?.trim()
        ? values.description.trim()
        : undefined,
    status: values.status?.trim() ? values.status.trim() : undefined,
    priority: values.priority?.trim() ? values.priority.trim() : undefined,
    dueDate: normalizeDueDate(values.dueDate),
});

export default function TaskCreateForm({
    columns,
    defaultColumnId,
    onSubmit,
    onCancel,
    isSubmitting,
    error,
}: TaskCreateFormProps) {
    const availableColumnId = useMemo(() => {
        if (defaultColumnId) {
            return defaultColumnId;
        }

        return columns[0]?.id ?? "";
    }, [columns, defaultColumnId]);

    const formik = useFormik<CreateTaskInput>({
        initialValues: {
            columnId: availableColumnId,
            title: "",
            description: "",
            status: "",
            priority: "",
            dueDate: "",
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            const sanitized = sanitizeValues(values);

            try {
                await onSubmit(sanitized);
                resetForm({
                    values: {
                        columnId: sanitized.columnId,
                        title: "",
                        description: "",
                        status: "",
                        priority: "",
                        dueDate: "",
                    },
                });
            } catch (submitError) {
                console.error(submitError);
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        if (!formik.values.columnId && availableColumnId) {
            formik.setFieldValue("columnId", availableColumnId, false);
        }
    }, [availableColumnId, formik]);

    const titleHasError = Boolean(formik.touched.title && formik.errors.title);
    const dueDateHasError = Boolean(
        formik.touched.dueDate && formik.errors.dueDate
    );

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Новая задача</h3>
            <p className="text-sm text-gray-500">
                Заполните поля, чтобы добавить задачу
            </p>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="task-title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Название
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        {...formik.getFieldProps("title")}
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${titleHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
                        placeholder="Например, Сверстать лендинг"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {titleHasError && (
                        <p className="text-sm text-red-500">{formik.errors.title}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="task-description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Описание
                    </label>
                    <textarea
                        id="task-description"
                        rows={3}
                        {...formik.getFieldProps("description")}
                        className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        placeholder="Кратко опишите, что нужно сделать"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="task-due-date"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Срок выполнения
                    </label>
                    <input
                        id="task-due-date"
                        type="datetime-local"
                        {...formik.getFieldProps("dueDate")}
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${dueDateHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {dueDateHasError && (
                        <p className="text-sm text-red-500">{formik.errors.dueDate}</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        {formik.isSubmitting || isSubmitting ? "Создаем..." : "Создать задачу"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        Отменить
                    </button>
                </div>
            </form>
        </div>
    );
}
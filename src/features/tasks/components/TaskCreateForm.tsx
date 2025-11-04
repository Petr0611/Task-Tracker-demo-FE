import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import type { Column } from "../../columns/types";
import type { CreateTaskInput } from "../types";
import { normalizeDueDate } from "../utils/formatDueDate";
import "../../../css/TaskCard.css";

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
    columnId: Yup.string().trim().required("Select a column"),
    title: Yup.string().trim().required("Enter a task title"),
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
         <div className="task-create-card">
            <div className="task-create-card__header">
                <h3 className="task-create-card__title">New task</h3>
                <p className="task-create-card__subtitle">
                    Fill in the fields to add a task
                </p>
            </div>

            {error && (
                <div className="task-create-card__alert" role="alert">
                    {error}
                </div>
            )}

            <form
                onSubmit={formik.handleSubmit}
                className={clsx("task-card__form", "task-create-card__form")}
            >
                <div className="task-card__field">
                    <label htmlFor="task-title" className="task-card__label">
                        Title
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        {...formik.getFieldProps("title")}
                        className={clsx(
                            "task-card__input",
                            titleHasError && "task-card__input--error"
                        )}
                        placeholder="For example, Design the landing page"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {titleHasError && (
                        <p className="task-card__error">{formik.errors.title}</p>
                    )}
                </div>

                <div className="task-card__field">
                    <label
                        htmlFor="task-description"
                        className="task-card__label"
                    >
                        Description
                    </label>
                    <textarea
                        id="task-description"
                        rows={3}
                        {...formik.getFieldProps("description")}
                        className="task-card__textarea"
                        placeholder="Briefly describe what needs to be done"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                </div>
                <div className="task-card__field">
                    <label htmlFor="task-due-date" className="task-card__label">
                        Due date
                    </label>
                    <input
                        id="task-due-date"
                        type="datetime-local"
                        {...formik.getFieldProps("dueDate")}
                        className={clsx(
                            "task-card__input",
                            dueDateHasError && "task-card__input--error"
                        )}
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {dueDateHasError && (
                        <p className="task-card__error">{formik.errors.dueDate}</p>
                    )}
                </div>
                <div className={clsx("task-card__actions-row", "task-create-card__actions")}>
                    <button
                        type="submit"
                        className={clsx(
                            "task-card__button",
                            "task-card__button--primary"
                        )}
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        {formik.isSubmitting || isSubmitting
                            ? "Creating..."
                            : "Create task"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={clsx(
                            "task-card__button",
                            "task-card__button--outline"
                        )}
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
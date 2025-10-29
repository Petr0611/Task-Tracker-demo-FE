import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { CreateColumnInput } from "../types";
import { getUserRole } from "../../../lib/api/projectApi";

interface ColumnFormProps {
    initialValues?: CreateColumnInput;
    submitLabel: string;
    onSubmit: (values: CreateColumnInput) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    error?: string;
    title?: string;
    description?: string;
    showCancelButton?: boolean;
    resetOnSubmit?: boolean;
    projectId: string;
}

interface ColumnFormValues {
    title: string;
    orderIndex: string;
    baseColumn: boolean;
}

const validationSchema = Yup.object({
    title: Yup.string().trim().required("Введите название колонки"),
    orderIndex: Yup.string()
        .trim()
        .matches(/^[0-9]*$/, "Порядок должен быть целым числом")
        .optional(),
    baseColumn: Yup.boolean().optional(),
});

const mapInitialValues = (
    initialValues?: CreateColumnInput
): ColumnFormValues => ({
    title: initialValues?.title ?? "",
    orderIndex:
        typeof initialValues?.orderIndex === "number"
            ? String(initialValues.orderIndex)
            : "",
    baseColumn: Boolean(initialValues?.baseColumn),
});

const sanitizeValues = (values: ColumnFormValues): CreateColumnInput => {
    const parsedOrderIndex = values.orderIndex
        ? parseInt(String(values.orderIndex).trim(), 10)
        : undefined;

    return {
        title: values.title.trim(),
        orderIndex:
            parsedOrderIndex === undefined || Number.isNaN(parsedOrderIndex)
                ? undefined
                : Math.max(0, parsedOrderIndex),
            baseColumn: values.baseColumn,
    };
};

export default function ColumnForm({
    initialValues,
    submitLabel,
    onSubmit,
    onCancel,
    isSubmitting,
    error,
    title,
    description,
    showCancelButton = false,
    resetOnSubmit = false,
    projectId,
}: ColumnFormProps) {
    const [isProjectOwner, setIsProjectOwner] = useState(false);

    useEffect(() => {
        let isMounted = true;

        if (!projectId || !initialValues) {
            setIsProjectOwner(false);
            return () => {
                isMounted = false;
            };
        }

        const fetchRole = async () => {
            try {
                const role = await getUserRole(projectId);
                if (isMounted) {
                    setIsProjectOwner(role === "OWNER");
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    setIsProjectOwner(false);
                }
            }
        };

        void fetchRole();

        return () => {
            isMounted = false;
        };
    }, [projectId, initialValues]);
    const formik = useFormik<ColumnFormValues>({
        initialValues: mapInitialValues(initialValues),
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            const sanitizedValues = sanitizeValues(values);

            try {
                await onSubmit(sanitizedValues);
                if (resetOnSubmit) {
                    resetForm({ values: mapInitialValues() });
                }
            } catch (submitError) {
                console.error(submitError);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const titleHasError = Boolean(formik.touched.title && formik.errors.title);
    const orderIndexHasError = Boolean(
        formik.touched.orderIndex && formik.errors.orderIndex
    );
    const shouldShowBaseColumnToggle = Boolean(
        initialValues && isProjectOwner
    );

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {(title || description) && (
                <div className="space-y-2 text-center">
                    {title && <h2 className="text-xl font-semibold">{title}</h2>}
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            )}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="column-title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Название
                    </label>
                    <input
                        id="column-title"
                        type="text"
                        {...formik.getFieldProps("title")}
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${titleHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
                        placeholder="Например, В работе"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {titleHasError && (
                        <p className="text-sm text-red-500">{formik.errors.title}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="column-order"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Порядок отображения
                    </label>
                    <input
                        id="column-order"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        {...formik.getFieldProps("orderIndex")}
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${orderIndexHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
                        placeholder="Например, 1"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {orderIndexHasError && (
                        <p className="text-sm text-red-500">{formik.errors.orderIndex}</p>
                    )}
                </div>

                {shouldShowBaseColumnToggle && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                id="column-base"
                                type="checkbox"
                                name="baseColumn"
                                checked={formik.values.baseColumn}
                                onChange={(event) =>
                                    formik.setFieldValue(
                                        "baseColumn",
                                        event.currentTarget.checked,
                                        true
                                    )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black"
                                disabled={formik.isSubmitting || isSubmitting}
                            />
                            <label
                                htmlFor="column-base"
                                className="text-sm font-medium text-gray-700"
                            >
                                Базовая колонка
                            </label>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        {formik.isSubmitting || isSubmitting ? "Сохраняем..." : submitLabel}
                    </button>

                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
                            disabled={formik.isSubmitting || isSubmitting}
                        >
                            Отменить
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
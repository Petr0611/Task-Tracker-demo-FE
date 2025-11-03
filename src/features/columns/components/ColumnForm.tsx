import { useEffect, useState } from "react";
import clsx from "clsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { CreateColumnInput } from "../types";
import { getUserRole } from "../../../lib/api/projectApi";
import "../../../css/ColumnForm.css";

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
    title: Yup.string().trim().required("Enter a column name"),
    orderIndex: Yup.string()
        .trim()
        .matches(/^[0-9]*$/, "Order must be an integer")
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
        <div className="column-form">
            {(title || description) && (
                <div className="column-form__intro">
                    {title && <h2 className="column-form__title">{title}</h2>}
                    {description && (
                        <p className="column-form__description">{description}</p>
                    )}
                </div>
            )}

            {error && (
                <div className="column-form__alert column-form__alert--error">
                    {error}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="column-form__form">
                <div className="column-form__field">
                    <label htmlFor="column-title" className="column-form__label">
                        Title
                    </label>
                    <input
                        id="column-title"
                        type="text"
                        {...formik.getFieldProps("title")}
                        className={clsx("column-form__input", {
                            "column-form__input--error": titleHasError,
                        })}
                        placeholder="For example, In progress"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {titleHasError && (
                        <p className="column-form__error">{formik.errors.title}</p>
                    )}
                </div>

                <div className="column-form__field">
                    <label htmlFor="column-order" className="column-form__label">
                        Display order
                    </label>
                    <input
                        id="column-order"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        {...formik.getFieldProps("orderIndex")}
                        className={clsx("column-form__input", {
                            "column-form__input--error": orderIndexHasError,
                        })}
                        placeholder="For example, 1"
                        disabled={formik.isSubmitting || isSubmitting}
                    />
                    {orderIndexHasError && (
                        <p className="column-form__error">
                            {formik.errors.orderIndex}
                        </p>
                    )}
                </div>

                {shouldShowBaseColumnToggle && (
                    <div className="column-form__toggle">
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
                            className="column-form__checkbox"
                            disabled={formik.isSubmitting || isSubmitting}
                        />
                        <label htmlFor="column-base" className="column-form__label">
                            Base column
                        </label>
                    </div>
                )}

                <div className="column-form__footer">
                    <button
                        type="submit"
                        className="column-form__button column-form__button--primary"
                        disabled={formik.isSubmitting || isSubmitting}
                    >
                        {formik.isSubmitting || isSubmitting ? "Saving..." : submitLabel}
                    </button>

                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="column-form__button column-form__button--secondary" 
                            disabled={formik.isSubmitting || isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
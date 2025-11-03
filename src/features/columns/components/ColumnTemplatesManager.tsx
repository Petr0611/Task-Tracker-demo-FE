import { useEffect, useMemo, useState, type FormEvent } from "react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    applyColumnTemplate,
    createColumnTemplate,
    getColumnTemplates,
    selectApplyColumnTemplateError,
    selectApplyingColumnTemplateIds,
    selectColumnTemplates,
    selectColumnTemplatesError,
    selectColumnTemplatesLoading,
    selectCreateColumnTemplateError,
    selectIsCreatingColumnTemplate,
} from "../slice/columnsSlice";
import type { ColumnTemplate } from "../types";
import "../../../css/ColumnTemplatesManager.css";

interface ColumnTemplatesManagerProps {
    projectId: string;
    onTemplateApplied?: () => void;
}

interface TemplateFormState {
    name: string;
    description: string;
}

const mapTemplateColumns = (template: ColumnTemplate): string => {
    if (!Array.isArray(template.columns) || template.columns.length === 0) {
        return "No columns";
    }

    return template.columns.map((column) => column.title).join(", ");
};

export default function ColumnTemplatesManager({
    projectId,
    onTemplateApplied,
}: ColumnTemplatesManagerProps) {
    const dispatch = useAppDispatch();
    const templates = useAppSelector(selectColumnTemplates);
    const isLoadingTemplates = useAppSelector(selectColumnTemplatesLoading);
    const templatesError = useAppSelector(selectColumnTemplatesError);
    const isCreatingTemplate = useAppSelector(selectIsCreatingColumnTemplate);
    const createTemplateError = useAppSelector(selectCreateColumnTemplateError);
    const applyingTemplateIds = useAppSelector(selectApplyingColumnTemplateIds);
    const applyTemplateError = useAppSelector(selectApplyColumnTemplateError);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formState, setFormState] = useState<TemplateFormState>({
        name: "",
        description: "",
    });
    const [localError, setLocalError] = useState<string | undefined>();

    useEffect(() => {
        void dispatch(getColumnTemplates());
    }, [dispatch]);

    const templatesByLatest = useMemo(
        () =>
            [...templates].sort((first, second) => {
                const firstDate = first.updatedAt ?? first.createdAt ?? "";
                const secondDate = second.updatedAt ?? second.createdAt ?? "";
                return secondDate.localeCompare(firstDate);
            }),
        [templates]
    );

    const handleSubmitTemplate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = formState.name.trim();

        if (!trimmedName) {
            setLocalError("Enter a template name");
            return;
        }

        setLocalError(undefined);

        try {
            await dispatch(
                createColumnTemplate({
                    projectId,
                    template: {
                        name: trimmedName,
                        description: formState.description,
                    },
                })
            ).unwrap();

            setFormState({ name: "", description: "" });
            setShowCreateForm(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleApplyTemplate = async (templateId: string) => {
        try {
            await dispatch(applyColumnTemplate({ templateId, projectId })).unwrap();
            onTemplateApplied?.();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="column-templates">
            <header className="column-templates__header">
                <div className="column-templates__intro">
                    <h2 className="column-templates__title">Board templates</h2>
                    <p className="column-templates__subtitle">
                        Save your column configurations and reuse them across other projects.
                    </p>
                </div>
                <div className="column-templates__actions">
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((prev) => !prev)}
                        className={clsx(
                            "column-templates__button column-templates__button--primary",
                            { "column-templates__button--active": showCreateForm }
                        )}
                        >
                        {showCreateForm ? "Hide form" : "Create template"}
                    </button>
                    <button
                        type="button"
                        onClick={() => void dispatch(getColumnTemplates())}
                        className="column-templates__button column-templates__button--ghost"
                        disabled={isLoadingTemplates}
                    >
                        {isLoadingTemplates ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            {(templatesError || applyTemplateError) && (
                <div className="column-templates__alerts">
                    {templatesError && (
                        <div className="column-templates__alert column-templates__alert--error">
                            {templatesError}
                        </div>
                    )}
                    {applyTemplateError && (
                        <div className="column-templates__alert column-templates__alert--error">
                            {applyTemplateError}
                        </div>
                    )}
                </div>
            )}

            {showCreateForm && (
                <form className="column-templates__form" onSubmit={handleSubmitTemplate}>
                    <div className="column-templates__field">
                        <label htmlFor="templateName" className="column-templates__label">
                            Template name
                        </label>
                        <input
                            id="templateName"
                            name="templateName"
                            type="text"
                            value={formState.name}
                            onChange={(event) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                }))
                            }
                            className="column-templates__input"
                            disabled={isCreatingTemplate}
                        />
                    </div>

                    <div className="column-templates__field">
                        <label htmlFor="templateDescription" className="column-templates__label">
                            Description
                        </label>
                        <textarea
                            id="templateDescription"
                            name="templateDescription"
                            rows={2}
                            value={formState.description}
                            onChange={(event) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                            className="column-templates__input column-templates__input--textarea"
                            disabled={isCreatingTemplate}
                        />
                    </div>

                    {(localError || createTemplateError) && (
                        <div className="column-templates__alert column-templates__alert--error">
                            {localError || createTemplateError}
                        </div>
                    )}

                    <div className="column-templates__form-actions">
                        <button
                            type="submit"
                            className="column-templates__button column-templates__button--primary"
                            disabled={isCreatingTemplate}
                        >
                            {isCreatingTemplate ? "Saving..." : "Save template"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setLocalError(undefined);
                            }}
                            className="column-templates__button column-templates__button--ghost"
                            disabled={isCreatingTemplate}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="column-templates__content">
                {isLoadingTemplates && (
                    <div className="column-templates__placeholder">
                        Loading available templates...
                    </div>
                )}

                {!isLoadingTemplates && templatesByLatest.length === 0 && (
                    <div className="column-templates__placeholder">
                        No saved templates yet. Create a new one to reuse it in other projects.
                    </div>
                )}

                {templatesByLatest.length > 0 && (
                    <ul className="column-templates__list">
                        {templatesByLatest.map((template) => {
                            const isApplying = Boolean(applyingTemplateIds[template.id]);

                            return (
                                <li key={template.id} className="column-templates__item">
                                    <div className="column-templates__item-inner">
                                        <div className="column-templates__item-info">
                                            <h3 className="column-templates__item-title">{template.name}</h3>
                                            <p className="column-templates__item-description">
                                                {template.description || "No description"}
                                            </p>
                                            <div className="column-templates__meta">
                                                <span>Columns: {template.columns?.length ?? 0}</span>
                                                <span>{mapTemplateColumns(template)}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleApplyTemplate(template.id)}
                                            className="column-templates__button column-templates__button--accent"
                                            disabled={isApplying}
                                        >
                                            {isApplying ? "Applying..." : "Apply to project"}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
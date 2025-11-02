import { useEffect, useMemo, useState, type FormEvent } from "react";
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
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Board templates
                    </h2>
                    <p className="text-sm text-gray-500">
                        Save your column configurations and reuse them across other projects.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((prev) => !prev)}
                        className="inline-flex items-center rounded-md bg-black px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        {showCreateForm ? "Hide form" : "Create template"}
                    </button>
                    <button
                        type="button"
                        onClick={() => void dispatch(getColumnTemplates())}
                        className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        disabled={isLoadingTemplates}
                    >
                        {isLoadingTemplates ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            {(templatesError || applyTemplateError) && (
                <div className="mt-4 space-y-2">
                    {templatesError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {templatesError}
                        </div>
                    )}
                    {applyTemplateError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {applyTemplateError}
                        </div>
                    )}
                </div>
            )}

            {showCreateForm && (
                <form className="mt-4 space-y-4" onSubmit={handleSubmitTemplate}>
                    <div className="space-y-2">
                        <label
                            htmlFor="templateName"
                            className="block text-sm font-medium text-gray-700"
                        >
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
                            className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                            disabled={isCreatingTemplate}
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="templateDescription"
                            className="block text-sm font-medium text-gray-700"
                        >
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
                            className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                            disabled={isCreatingTemplate}
                        />
                    </div>

                    {(localError || createTemplateError) && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {localError || createTemplateError}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
                            className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            disabled={isCreatingTemplate}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-5 space-y-3">
                {isLoadingTemplates && (
                    <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                        Loading available templates...
                    </div>
                )}

                {!isLoadingTemplates && templatesByLatest.length === 0 && (
                    <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                        No saved templates yet. Create a new one to reuse it in other projects.
                    </div>
                )}

                {templatesByLatest.length > 0 && (
                    <ul className="space-y-3">
                        {templatesByLatest.map((template) => {
                            const isApplying = Boolean(
                                applyingTemplateIds[template.id]
                            );

                            return (
                                <li
                                    key={template.id}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {template.description || "No description"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Columns: {template.columns?.length ?? 0}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {mapTemplateColumns(template)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleApplyTemplate(template.id)}
                                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                            disabled={isApplying}
                                        >
                                            {isApplying
                                                ? "Applying..."
                                                : "Apply to project"}
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
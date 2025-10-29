import type { Task } from "../../tasks/types";

export interface Column {
    id: string;
    projectId: string;
    title: string;
    orderIndex: number;
    baseColumn: boolean;
    tasks: Task[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ColumnTemplateColumn {
    id: string;
    title: string;
    orderIndex: number;
}

export interface ColumnTemplate {
    id: string;
    name: string;
    description?: string;
    columns: ColumnTemplateColumn[];
    createdAt?: string;
    updatedAt?: string;
}


export interface CreateColumnDto {
    title: string;
    orderIndex?: number;
    baseColumn?: boolean;
}


export interface CreateColumnTemplateDto {
    name: string;
    description?: string;
}

export interface ApplyColumnTemplateDto {
    projectId: string;
}


export interface UpdateColumnDto {
    title?: string;
    orderIndex?: number;
    baseColumn?: boolean;
}

export interface CreateColumnInput {
    title: string;
    orderIndex?: number;
    baseColumn?: boolean;
}

export interface ColumnsSliceState {
    columnsByProject: Record<string, Column[]>;
    isLoading: boolean;
    error?: string;
    isCreating: boolean;
    createColumnError?: string;
    updatingColumnIds: Record<string, boolean>;
    updateColumnError?: string;
    deletingColumnIds: Record<string, boolean>;
    deleteColumnError?: string;
    columnDetailsById: Record<string, Column | undefined>;
    columnDetailsLoading: Record<string, boolean>;
    columnDetailsError: Record<string, string | undefined>;
    columnTemplates: ColumnTemplate[];
    columnTemplatesLoading: boolean;
    columnTemplatesError?: string;
    isCreatingColumnTemplate: boolean;
    createColumnTemplateError?: string;
    applyingColumnTemplateIds: Record<string, boolean>;
    applyColumnTemplateError?: string;
}
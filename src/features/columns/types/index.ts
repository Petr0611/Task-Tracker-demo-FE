import type { Task } from "../../tasks/types";

export interface Column {
    id: string;
    projectId: string;
    title: string;
    orderIndex: number;
    tasks: Task[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateColumnDto {
    title: string;
    orderIndex?: number;
}

export interface UpdateColumnDto {
    title?: string;
    orderIndex?: number;
}

export interface CreateColumnInput {
    title: string;
    orderIndex?: number;
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
}
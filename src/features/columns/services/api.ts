import axiosInstance from "../../../lib/axiosInstance";
import type {
    ApplyColumnTemplateDto,
    Column,
    ColumnTemplate,
    CreateColumnDto,
    CreateColumnTemplateDto,
    UpdateColumnDto,
} from "../types";

const COLUMNS_BASE_PATH = "/columns";
const COLUMN_TEMPLATES_BASE_PATH = "/task-columns/templates";

export const fetchColumnById = async (columnId: string): Promise<Column> => {
    const res = await axiosInstance.get(`${COLUMNS_BASE_PATH}/${columnId}`);
    return res.data;
};

export const updateColumnById = async (
    columnId: string,
    columnDto: UpdateColumnDto
): Promise<Column> => {
    const res = await axiosInstance.put(
        `${COLUMNS_BASE_PATH}/${columnId}`,
        columnDto
    );
    return res.data;
};

export const deleteColumnById = async (columnId: string): Promise<void> => {
    await axiosInstance.delete(`${COLUMNS_BASE_PATH}/${columnId}`);
};

export const fetchColumnsByProject = async (
    projectId: string
): Promise<Column[]> => {
    const res = await axiosInstance.get(
        `/projects/${projectId}/columns`
    );
    return res.data;
};

export const createColumnForProject = async (
    projectId: string,
    columnDto: CreateColumnDto
): Promise<Column> => {
    const res = await axiosInstance.post(
        `/projects/${projectId}/columns`,
        columnDto
    );
    return res.data;
};



export const fetchColumnTemplates = async (): Promise<ColumnTemplate[]> => {
    const res = await axiosInstance.get(COLUMN_TEMPLATES_BASE_PATH);
    return res.data;
};

export const createColumnTemplateFromProject = async (
    projectId: string,
    payload: CreateColumnTemplateDto
): Promise<ColumnTemplate> => {
    const res = await axiosInstance.post(
        `${COLUMN_TEMPLATES_BASE_PATH}/project/${projectId}`,
        payload
    );
    return res.data;
};

export const applyColumnTemplateToProject = async (
    templateId: string,
    payload: ApplyColumnTemplateDto
): Promise<Column[]> => {
    const res = await axiosInstance.post(
        `${COLUMN_TEMPLATES_BASE_PATH}/${templateId}/apply`,
        payload
    );
    return res.data;
};
import axiosInstance from "../../../lib/axiosInstance";
import type { Column, CreateColumnDto, UpdateColumnDto } from "../types";

const COLUMNS_BASE_PATH = "/columns";

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
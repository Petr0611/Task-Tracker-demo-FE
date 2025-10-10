import axiosInstance from "../../../lib/axiosInstance";
import type { CreateProjectDto } from "../types";

// we already added  prefix /api in axios config

const PROJECTS_BASE_PATH = "/projects";

export const fetchProjects = async () => {
  const res = await axiosInstance.get(PROJECTS_BASE_PATH);
  return res.data;
};

export const fetchCreateProject = async (projectDto: CreateProjectDto) => {
  const res = await axiosInstance.post(PROJECTS_BASE_PATH, projectDto);
  return res.data;
};

import axiosInstance from "../../../lib/axiosInstance";
import type { CreateProjectDto } from "../types";

const PROJECTS_BASE_PATH = "/projects";
const MY_PROJECTS_BASE_PATH = "/projects/my";

export const fetchProjects = async () => {
  const res = await axiosInstance.get(MY_PROJECTS_BASE_PATH);
  console.log("API response:", res.data);

  return res.data;
};

export const fetchCreateProject = async (projectDto: CreateProjectDto) => {
  const res = await axiosInstance.post(PROJECTS_BASE_PATH, projectDto);
  return res.data;
};

import { createAppSlice } from "../../../app/createAppSlice";
import type { CreateProjectDto, ProjectsSliceState } from "../types";
import * as api from "../services/api";
import { type AxiosError } from "axios";
import type { RootState } from "../../../app/store";
import { createSelector } from "@reduxjs/toolkit/react";
import { handleApiError } from "../../../lib/api/apiErrorHandler";

const initialState: ProjectsSliceState = {
  projects: [],
  isLoading: false,
};

export const projectsSlice = createAppSlice({
  name: "projects",
  initialState,
  reducers: (create) => ({
    getAllProjects: create.asyncThunk(
      async () => {
        return api
          .fetchProjects()
          .catch((err: AxiosError<{ message: string }>) => {
            throw new Error(err.response?.data?.message);
          });
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.projects = action.payload;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.projects = [];
          console.log(action.error);
        },
      }
    ),

    createProject: create.asyncThunk(
      async (dto: CreateProjectDto) => {
        try {
          const response = await api.fetchCreateProject(dto);
          return response;
        } catch (err) {
          const message = handleApiError(err);
          throw new Error(JSON.stringify(message));
        }
      },
      {
        pending: (state) => {
          state.createProjectErrorMessage = "";
        },
        fulfilled: (state, action) => {
          state.projects.push(action.payload);
          state.createProjectErrorMessage = "";
        },
        rejected: (state, action) => {
          try {
            const parsed = JSON.parse(action.error.message || "");
            state.createProjectErrorMessage = parsed;
          } catch {
            state.createProjectErrorMessage =
              action.error.message || "Error creating project";
          }
        },
      }
    ),
  }),
  selectors: {
    selectProjects: (state) => state.projects,
    selectIsLoading: (state) => state.isLoading,
    selectCreateProjectErrorMessage: (state) => state.createProjectErrorMessage,
  },
});
export const { createProject, getAllProjects } = projectsSlice.actions;
export const {
  selectProjects,
  selectIsLoading,
  selectCreateProjectErrorMessage,
} = projectsSlice.selectors;

export const selectMemoizedProjects = createSelector(
  (state: RootState) => selectProjects(state),
  (projects) => projects
);

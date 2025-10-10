import { createAppSlice } from "../../../app/createAppSlice";
import type { CreateProjectDto, ProjectsSliceState } from "../types";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";

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
            // раскрываем ошибку от аксиоса и получаем сообщение
            // бросаем новую ошибку, которая поподет в rejected case
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
        return api.fetchCreateProject(dto).catch((err) => {
          if (isAxiosError(err)) {
            throw new Error(
              err.response?.data?.message || "Internal Server Error"
            );
          }
        });
        // The value we return becomes the `fulfilled` action payload
      },
      {
        pending: (state) => {
          // TODO add spinner here
          state.createProjectErrorMessage = "";
        },
        fulfilled: (state, action) => {
          state.projects.push(action.payload);
          state.createProjectErrorMessage = "";
        },
        rejected: (state, action) => {
          state.createProjectErrorMessage = action.error.message;
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectProjects: (state) => state.projects,
    selectIsLoading: (state) => state.isLoading,
    selectCreateProjectErrorMessage: (state) => state.createProjectErrorMessage,
  },
});

// // Action creators are generated for each case reducer function.
export const { createProject, getAllProjects } = projectsSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectProjects,
  selectIsLoading,
  selectCreateProjectErrorMessage,
} = projectsSlice.selectors;

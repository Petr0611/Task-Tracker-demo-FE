import axiosInstance from "../axiosInstance";

export const getUserRole = async (projectId: string) => {
  const responce = await axiosInstance.get(
    `/api/v1/projects/${projectId}/role`
  );
  return responce.data.role as "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
};

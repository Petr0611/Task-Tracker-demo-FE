import { useEffect, useState } from "react";
import { getUserRole } from "../../../lib/api/projectApi";
import ProjectActions from "./ProjectActions";
import AccessDenied from "./AccessDenied";
import { AxiosError } from "axios";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export default function RoleUIBlock({ projectId }: { projectId: string }) {
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getUserRole(projectId);
        setRole(userRole);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 403) {
          setError(true);
        } else {
          console.error("Unexpected error while fetching user role:", err);
          setError(true);
        }
      }
    };
    fetchRole();
  }, [projectId]);

  if (error) return <AccessDenied />;
  if (!role)
    return (
      <p className="text-gray-500 text-center mt-10 animate-pulse">
        Loading access rights...
      </p>
    );

  return <ProjectActions role={role} projectId={projectId} />;
}

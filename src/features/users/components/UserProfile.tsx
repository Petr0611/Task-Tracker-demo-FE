import { useEffect, useState, type JSX, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../lib/axiosInstance";
import type { UserDetails } from "../types";
import UserDisplay from "../../users/components/UserDisplay";
import UserForm from "./UserForm";

export default function UserProfile(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async (): Promise<void> => {
      try {
        const res = await axiosInstance.get<UserDetails>("/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async (): Promise<void> => {
      try {
        const res = await axiosInstance.get<UserDetails>("/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const url = id ? `/users/${id}` : "/users/me";
        const res = await axiosInstance.get<UserDetails>(url, {
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleLogout = async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      setUserData(null);
      window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: null }));
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (!userData) return;
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Avatar-Upload
  const handleAvatarChange = async (
    fileOrUrl: string | File | null
  ): Promise<void> => {
    if (!userData) return;

    try {
      if (fileOrUrl instanceof File) {
        const formData = new FormData();
        formData.append("file", fileOrUrl);
        formData.append("email", userData.email);

        const res = await axiosInstance.post("/avatars/upload", formData, {
          withCredentials: true,
        });

        setUserData({ ...userData, avatarUrl: res.data });
      } else {
        setUserData({ ...userData, avatarUrl: fileOrUrl });
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Avatar upload failed!");
    }
  };

  // Save
  const handleSave = async (): Promise<void> => {
    if (!userData) return;
    try {
      const url = id ? `/users/update/${id}` : "/users/update";
      const response = await axiosInstance.put<UserDetails>(url, userData, {
        withCredentials: true,
      });

      const updatedUser = response.data;
      setUserData(updatedUser);
      setIsEdit(false);

      if (currentUser && updatedUser.email === currentUser.email) {
        window.dispatchEvent(
          new CustomEvent("avatarUpdated", {
            detail: {
              avatarUrl: updatedUser.avatarUrl,
              email: updatedUser.email,
            },
          })
        );
      }

      alert("Profile successfully updated!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error while saving!");
    }
  };

  // Loading / Error Handling
  if (loading) return <p>Loading user...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!userData || !currentUser) return <p>No user found!</p>;

  const isAdmin = currentUser.role === "ROLE_ADMIN";
  const isOwnProfile = currentUser.email === userData.email;
  const canEdit = isOwnProfile || isAdmin;

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6 rounded-lg border bg-white shadow-sm mt-10 flex flex-col items-center justify-center">
      {!isEdit ? (
        <UserDisplay
          userData={userData}
          canEdit={canEdit}
          onEdit={() => setIsEdit(true)}
          onLogout={isOwnProfile ? handleLogout : undefined}
        />
      ) : (
        <UserForm
          userData={userData}
          currentUser={currentUser}
          handleChange={handleChange}
          handleAvatarChange={handleAvatarChange}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}

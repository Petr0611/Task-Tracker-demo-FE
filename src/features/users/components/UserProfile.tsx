import { useEffect, useState, type JSX, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../lib/axiosInstance";
import type { UserDetails } from "../types";
import UserDisplay from "../../users/components/UserDisplay";
import UserForm from "./UserForm";

export default function UserProfile(): JSX.Element {
  const { id } = useParams<{ id?: string }>(); // 👈 holt ID aus URL, z.B. /users/:id
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Lade aktuellen eingeloggten Benutzer
  useEffect(() => {
    const fetchCurrentUser = async () => {
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

  // 2️⃣ Lade angezeigtes Profil
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // wenn URL ID vorhanden ist → fremdes Profil
        // sonst → eigenes Profil
        const url = id ? `/users/${id}` : "/users/me";

        const res = await axiosInstance.get<UserDetails>(url, {
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (err: unknown) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]); // 👈 neu: reagiert auf Änderung der URL

  // Logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      setUserData(null);
      window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: null }));
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Textarea / Input ändern
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!userData) return;
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Avatar ändern
  const handleAvatarChange = async (fileOrUrl: string | File | null) => {
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

  // Speichern
  const handleSave = async () => {
    if (!userData) return;
    try {
      const url = id ? `/users/update/${id}` : "/users/update";
      const res = await axiosInstance.put<UserDetails>(url, userData, {
        withCredentials: true,
      });

      setUserData(res.data);
      setIsEdit(false);

      window.dispatchEvent(
        new CustomEvent("avatarUpdated", { detail: res.data.avatarUrl })
      );

      alert("Profile successfully updated!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error while saving!");
    }
  };

  if (loading) return <p>Loading user...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!userData) return <p>No user found.</p>;

  // check rights
  const isAdmin = currentUser?.role === "ROLE_ADMIN";

  const isOwnProfile = currentUser?.email === userData.email;
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
          handleChange={handleChange}
          handleAvatarChange={handleAvatarChange}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}

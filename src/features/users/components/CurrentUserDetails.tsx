import { useEffect, useState, type ChangeEvent, type JSX } from "react";
import axiosInstance from "../../../lib/axiosInstance";
import type { UserDetails } from "../types";
import { Link } from "react-router-dom";

export default function CurrentUserDetails(): JSX.Element {
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/me");
        setUserData(res.data);
      } catch (err) {
        console.error("Error!:", err);
      }
    };

    fetchUser();
  }, []);

  if (!userData)
    return (
      <div className="flex flex-col items-center justify-content-cente">
        {" "}
        <Link
          to="/login"
          className="rounded bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Sign in
        </Link>
      </div>
    );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!userData) return;
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put("/users/update", userData);
      setUserData(res.data);
      setIsEdit(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      setUserData(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6 rounded-lg border bg-white shadow-sm mt-10 flex flex-col items-center justify-content-center">
      {userData.avatarUrl ? (
        <img
          src={userData.avatarUrl}
          alt={`${userData.displayName ?? "User"} avatar`}
          loading="lazy"
          className="w-32 h-32 m-10 rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-32 h-32 m-10 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700 border-2 border-gray-200">
          {userData.displayName
            ? userData.displayName
                .toString()
                .toUpperCase()
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : userData.email[0].toString().toUpperCase()}
        </div>
      )}

      {!isEdit ? (
        <div>
          <div className="flex justify-between">
            <label form="userName" className="font-bold flex">
              Display Name:
            </label>
            {userData.displayName && (
              <p className="userName"> {userData.displayName}</p>
            )}
          </div>
          <div className="flex justify-between">
            <label form="userEmail" className="font-bold flex">
              E-Mail:
            </label>
            {userData.displayName && (
              <p className="userEmail"> {userData.email}</p>
            )}
          </div>
          <div className="flex justify-between">
            <label form="userEmail" className="font-bold flex">
              Department:
            </label>
            {userData.displayName && (
              <p className="userEmail"> {userData.department}</p>
            )}
          </div>
          <div className="flex justify-between">
            <label form="userEmail" className="font-bold flex">
              Position:
            </label>
            {userData.displayName && (
              <p className="userEmail"> {userData.position}</p>
            )}
          </div>
          {userData.bio && <p className="mt-5">{userData.bio}</p>}
          <button
            className="mt-10 w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
          <button
            className="mt-5 w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="max-w-70 flex flex-col gap-5 items-center justify-content-center">
          <input
            name="displayName"
            value={userData.displayName || ""}
            onChange={handleChange}
            placeholder="Display Name"
            className="border p-3 rounded-lg w-75"
          />
          <input
            name="department"
            value={userData.department || ""}
            onChange={handleChange}
            placeholder="Department"
            className="border p-3 rounded-lg w-75"
          />
          <input
            name="position"
            value={userData.position || ""}
            onChange={handleChange}
            placeholder="Position"
            className="border p-3 rounded-lg w-75"
          />
          <textarea
            name="bio"
            value={userData.bio || ""}
            onChange={handleChange}
            maxLength={300}
            placeholder="Bio (max 300 characters)"
            className="border p-3 w-75 rounded-lg resize-none h-fit focus:ring-black"
          />
          <button
            onClick={handleSave}
            className="mt-4 w-full rounded bg-black text-white p-2 hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

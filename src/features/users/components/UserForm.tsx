import type { UserDetails } from "../types";
import type { ChangeEvent, JSX } from "react";
import { useState } from "react";
import AvatarSelector from "./AvatarSelector";
import ChangePasswordForm from "../components/ChangePasswordForm";

interface Props {
  userData: UserDetails;
  currentUser: UserDetails;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleAvatarChange: (avatar: string | File | null) => void;
  handleSave: () => Promise<void>;
}

export default function UserForm({
  userData,
  currentUser,
  handleChange,
  handleAvatarChange,
  handleSave,
}: Props): JSX.Element {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const canChangePassword =
    currentUser.role === "ROLE_ADMIN" && currentUser.id !== userData.id;
  const selfChange = currentUser.id === userData.id;

  return (
    <div className="flex flex-col gap-4 w-full">
      <AvatarSelector userData={userData} onAvatarChange={handleAvatarChange} />
      <input
        name="displayName"
        value={userData.displayName || ""}
        onChange={handleChange}
        placeholder="Display Name"
        className="border p-3 rounded-lg w-full"
      />
      <input
        name="department"
        value={userData.department || ""}
        onChange={handleChange}
        placeholder="Department"
        className="border p-3 rounded-lg w-full"
      />
      <input
        name="position"
        value={userData.position || ""}
        onChange={handleChange}
        placeholder="Position"
        className="border p-3 rounded-lg w-full"
      />
      <textarea
        name="bio"
        value={userData.bio || ""}
        onChange={handleChange}
        maxLength={300}
        placeholder="Bio (max 300 characters)"
        className="border p-3 w-full rounded-lg resize-none h-fit focus:ring-black"
      />
      <button
        onClick={handleSave}
        className="mt-4 w-full rounded bg-black text-white p-2 hover:bg-gray-800"
      >
        Save
      </button>
      {showChangePassword && (
        <div className="mt-4">
          {selfChange ? (
            <ChangePasswordForm />
          ) : canChangePassword && userData.id ? (
            <ChangePasswordForm
              isAdminChanging={true}
              userId={String(userData.id)}
            />
          ) : null}
        </div>
      )}{" "}
      {(selfChange || canChangePassword) && (
        <button
          onClick={() => setShowChangePassword((prev) => !prev)}
          className="mt-4 w-full rounded bg-blue-600 text-white p-2 hover:bg-blue-500"
        >
          {showChangePassword ? "Cancel" : "Change Password"}
        </button>
      )}
    </div>
  );
}

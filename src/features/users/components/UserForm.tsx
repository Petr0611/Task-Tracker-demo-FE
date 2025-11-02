import type { UserDetails } from "../types";
import type { ChangeEvent, JSX } from "react";
import AvatarSelector from "./AvatarSelector";

interface Props {
  userData: UserDetails;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleAvatarChange: (avatar: string | File | null) => void;
  handleSave: () => Promise<void>;
}

export default function UserForm({
  userData,
  handleChange,
  handleAvatarChange,
  handleSave,
}: Props): JSX.Element {
  return (
    <div className="max-w-70 flex flex-col gap-5 items-center justify-center w-full">
      {/* Avatar-Selector */}
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
    </div>
  );
}

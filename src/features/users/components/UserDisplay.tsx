import { type JSX } from "react";
import type { UserDetails } from "../types";

interface UserDisplayProps {
  userData: UserDetails;
  canEdit: boolean;
  onEdit: () => void;
  onLogout?: () => void;
}

export default function UserDisplay({
  userData,
  canEdit,
  onEdit,
  onLogout,
}: UserDisplayProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      {userData.avatarUrl ? (
        <img
          src={userData.avatarUrl}
          alt="Avatar"
          className="w-32 h-32 m-10 rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-32 h-32 m-10 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700 border-2 border-gray-200">
          {userData.displayName
            ? userData.displayName
                .toUpperCase()
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : userData.email[0].toUpperCase()}
        </div>
      )}

      <div className="flex flex-col items-start gap-2">
        <p>
          <strong>Name:</strong> {userData.displayName}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Department:</strong> {userData.department || "—"}
        </p>
        <p>
          <strong>Position:</strong> {userData.position || "—"}
        </p>
        {userData.bio && <p className="mt-5">{userData.bio}</p>}
      </div>

      {canEdit && (
        <>
          <button
            onClick={onEdit}
            className="mt-6 w-full rounded bg-black text-white p-2 hover:bg-gray-800"
          >
            Edit
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-4 w-full rounded bg-black text-white p-2 hover:bg-gray-800"
            >
              Logout
            </button>
          )}
        </>
      )}
    </div>
  );
}

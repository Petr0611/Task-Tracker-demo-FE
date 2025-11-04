import { type JSX } from "react";
import type { UserDetails } from "../types";
import "../../../css/Profile.css";

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
    <div className="profile-wrapper">
      <header className="profile-header">
        <div className="profile-label">User Profile</div>
        <h1 id="login-title" className="profile-title">
          Hey There!
        </h1>
        <div className="profile-subtitle">
          There are some user details in the overview
        </div>
      </header>
      <div className="icon-field">
        {userData.avatarUrl ? (
          <img
            src={userData.avatarUrl}
            alt="Avatar"
            className="avatar-icon no-hover"
          />
        ) : (
          <div className="avatar-icon no-hover">
            {userData.displayName
              ? userData.displayName
                  .trim()
                  .toUpperCase()
                  .split(/\s+/)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              : userData.email[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="profile-form">
        {userData.displayName && (
          <div className="profile-field">
            <div className="profile-field-label">Name:</div>
            <div className="profile-details">{userData.displayName || "-"}</div>
          </div>
        )}

        <div className="profile-field">
          <div className="profile-field-label">Email:</div>
          <div className="profile-details">{userData.email}</div>
        </div>

        {userData.department && (
          <div className="profile-field">
            <div className="profile-field-label">Department:</div>
            <div className="profile-details">{userData.department || "—"}</div>
          </div>
        )}
        {userData.position && (
          <div className="profile-field">
            <div className="profile-field-label">Position:</div>
            <div className="profile-details">{userData.position || "—"}</div>
          </div>
        )}
        {userData.bio && (
          <div className="profile-field">
            <div className="profile-field-label">Bio:</div>
            <div className="profile-details">{userData.bio || "—"}</div>
          </div>
        )}
      </div>

      {canEdit && (
        <>
          <button onClick={onEdit} className="profile-button">
            Edit
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="profile-button profile-button--primary"
            >
              Logout
            </button>
          )}
        </>
      )}
    </div>
  );
}

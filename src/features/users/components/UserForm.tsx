import type { UserDetails } from "../types";
import type { ChangeEvent, JSX } from "react";
import { useState } from "react";
import AvatarSelector from "./AvatarSelector";
import ChangePasswordForm from "../components/ChangePasswordForm";
import "../../../css/Profile.css";

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
    <div className="profile-wrapper">
      <header className="profile-header">
        <span className="profile-label">Edit Profile</span>
        <h1 id="login-title" className="profile-title">
          Add Details
        </h1>
        <div className="profile-subtitle">Edit your peronal data</div>
      </header>
      <AvatarSelector userData={userData} onAvatarChange={handleAvatarChange} />
      <div className="profile-form">
        <label htmlFor="displayName" className="profile-field-label">
          Display Name
        </label>
        <input
          name="displayName"
          value={userData.displayName || ""}
          onChange={handleChange}
          placeholder="Display Name"
          className="profile-input"
        />
        <label htmlFor="department" className="profile-field-label">
          Department
        </label>
        <input
          name="department"
          value={userData.department || ""}
          onChange={handleChange}
          placeholder="Department"
          className="profile-input"
        />
        <label htmlFor="position" className="profile-field-label">
          Position
        </label>
        <input
          name="position"
          value={userData.position || ""}
          onChange={handleChange}
          placeholder="Position"
          className="profile-input"
        /> <label htmlFor="bio" className="profile-field-label">
          Bio
        </label>
        <textarea
          name="bio"
          value={userData.bio || ""}
          onChange={handleChange}
          maxLength={300}
          placeholder="Bio (max 300 characters)"
          className="profile-input"
        />
        <button onClick={handleSave} className="profile-button">
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
            className="profile-button profile-button--primary"
          >
            {showChangePassword ? "Cancel" : "Change Password"}
          </button>
        )}
      </div>
    </div>
  );
}

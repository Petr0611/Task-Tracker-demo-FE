import { useRef, useState } from "react";
import type { UserDetails } from "../types";
import avatar1 from "../../../assets/avatars/avatar01.webp";
import avatar2 from "../../../assets/avatars/avatar02.webp";
import avatar3 from "../../../assets/avatars/avatar03.webp";
import avatar4 from "../../../assets/avatars/avatar04.webp";
import avatar5 from "../../../assets/avatars/avatar05.webp";
import avatar6 from "../../../assets/avatars/avatar06.webp";
import avatar7 from "../../../assets/avatars/avatar07.webp";
import avatar8 from "../../../assets/avatars/avatar08.webp";
import avatar9 from "../../../assets/avatars/avatar09.webp";
import avatar10 from "../../../assets/avatars/avatar10.webp";
import avatar11 from "../../../assets/avatars/avatar11.webp";
import avatar12 from "../../../assets/avatars/avatar12.webp";
import avatar13 from "../../../assets/avatars/avatar13.webp";
import uploadIcon from "../../../assets/ui/upload_icon.webp";
import resetIcon from "../../../assets/ui/reset_icon.webp";
import axiosInstance from "../../../lib/axiosInstance";
import "../../../css/Profile.css";

interface AvatarSelectorProps {
  userData: UserDetails;
  onAvatarChange: (fileOrUrl: File | string | null) => void;
}

export default function AvatarSelector({
  userData,
  onAvatarChange,
}: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localAvatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
    avatar11,
    avatar12,
    avatar13,
  ];

  const displayAvatar = previewUrl || userData.avatarUrl || null;

  // local choice
  const handleLocalSelect = (url: string) => {
    setPreviewUrl(url);
    onAvatarChange(url);
    setIsOpen(false);
  };

  // file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", userData.email);

    try {
      const response = await axiosInstance.post("/avatars/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setPreviewUrl(response.data);
        onAvatarChange(response.data);
        setIsOpen(false);
      }
    } catch (err: unknown) {
      console.error("Avatar Upload failed:", err);
      alert("Error! Avatar Upload failed!");
    }
  };

  // Reset
  const handleReset = async () => {
    try {
      if (userData.avatarUrl) {
        await axiosInstance.delete("/avatars/delete", {
          params: { email: userData.email },
        });
      }

      setPreviewUrl(null);
      onAvatarChange("");
      setIsOpen(false);
    } catch (err) {
      console.error("Avatar deletion failed:", err);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayAvatar ? (
          <img src={displayAvatar} alt="User avatar" className="avatar-icon" />
        ) : (
          <div className="avatar-icon">
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

      {isOpen && (
        <div className="absolute top-44 w-60 bg-white shadow-xl rounded-2xl border border-gray-100 p-3 z-20">
          <div className="grid grid-cols-3 gap-3">
            {localAvatars.map((src) => (
              <img
                key={src}
                src={src}
                alt="avatar option"
                className="w-16 h-16 rounded-full object-cover border-5 border-[#c2c2c2] hover:border-blue-500 cursor-pointer"
                onClick={() => handleLocalSelect(src)}
              />
            ))}

            {/* Upload Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full border-5 border-dashed border-[#c2c2c2] flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
              title="Upload"
            >
              <img src={uploadIcon} alt="upload icon" className="w-15 h-15" />
            </div>

            {/* Reset Button */}
            <div
              onClick={handleReset}
              className="w-16 h-16 rounded-full border-5 border-dashed border-[#c2c2c2] flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
              title="Reset"
            >
              <img src={resetIcon} alt="reset icon" className="w-15 h-15" />
            </div>
          </div>

          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

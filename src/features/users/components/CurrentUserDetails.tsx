import { useEffect, useState, type JSX } from "react";
import axiosInstance from "../../../lib/axiosInstance";
import type { UserDetails } from "../types";

export default function CurrentUserDetails(): JSX.Element {
  const [userData, setUserData] = useState<UserDetails | null>(null);

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

  if (!userData) return <div>Loading profile...</div>;

  return (
    <div>
      {userData.avatarUrl ? (
        <img
          src={userData.avatarUrl}
          alt={`${userData.displayName ?? "User"} avatar`}
          loading="lazy"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700 border-2 border-gray-200">
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
      {userData.displayName && <p>Display Name: {userData.displayName}</p>}
      {userData.email && <p>E-Mail: {userData.email}</p>}
      {userData.department && <p>Department: {userData.department}</p>}
      {userData.position && <p>Position: {userData.position}</p>}
      {userData.bio && <p>Bio: {userData.bio}</p>}
      <button className="w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
        Edit
      </button>
    </div>
  );
}

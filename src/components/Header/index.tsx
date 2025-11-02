import { Link } from "react-router-dom";
import logo from "../../assets/images/logo_s.webp";
import { useEffect, useState } from "react";
import type { UserDetails } from "../../features/users/types";
import axiosInstance from "../../lib/axiosInstance";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/slice/authSlice";

export default function Header() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [user, setUser] = useState<UserDetails | null>(null);

  // get user data from server
  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get<UserDetails>("/users/me", {
        withCredentials: true,
      });
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  // first listener register
  useEffect(() => {
    const handleAvatarUpdate = (e: CustomEvent) => {
      setUser((prev) => (prev ? { ...prev, avatarUrl: e.detail } : prev));
    };

    const handleLogin = () => fetchUser();
    const handleLogout = () => setUser(null);

    window.addEventListener(
      "avatarUpdated",
      handleAvatarUpdate as EventListener
    );
    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);

    // Fallback to session-cookie
    fetchUser();

    return () => {
      window.removeEventListener(
        "avatarUpdated",
        handleAvatarUpdate as EventListener
      );
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  return (
    <header className="w-full bg-gradient-to-t from-teal-400 to-emerald-400 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-gray-900">
          <img src={logo} alt="logo" />
        </Link>
        {/* Navigation Links */}
        <nav className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            About
          </Link>
          <Link
            to="/projects"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Projects
          </Link>

          {user ? (
            <Link to="/profile" className="flex items-center space-x-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full border-2 border-white transition-transform duration-200 hover:scale-110"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-white transition-transform duration-200 hover:scale-110">
                  {user.displayName
                    ? user.displayName
                        .toUpperCase()
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                    : user.email[0].toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-black transition"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="rounded bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

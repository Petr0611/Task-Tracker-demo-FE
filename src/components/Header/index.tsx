import { Link, useLocation  } from "react-router-dom";
import logo from "../../assets/images/logo_s.webp";
import { useEffect, useState, useRef } from "react";
import type { UserDetails } from "../../features/users/types";
import axiosInstance from "../../lib/axiosInstance";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/slice/authSlice";
import clsx from "clsx";

export default function Header() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userRef = useRef<UserDetails | null>(null);
  const menuContainerRef = useRef<HTMLElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();

  const userDisplayName = user?.displayName?.trim() || user?.email || "Profile";

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  useEffect(() => {
    const handleAvatarUpdate = (e: CustomEvent) => {
      if (!userRef.current || !e.detail) return;

      const { avatarUrl, email } = e.detail as {
        avatarUrl: string;
        email?: string;
      };
      if (email && email === userRef.current.email) {
        setUser((prev) => (prev ? { ...prev, avatarUrl } : prev));
      }
    };

    const handleLogin = () => fetchUser();
    const handleLogout = () => setUser(null);

    window.addEventListener(
      "avatarUpdated",
      handleAvatarUpdate as EventListener
    );
    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuContainerRef.current?.contains(target) ||
        toggleButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.removeProperty("overflow");
    };
  }, [isMenuOpen]);

  const navClassName = clsx(
    "md:relative md:mt-0 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:text-gray-900 md:shadow-none md:backdrop-blur-none",
    isMenuOpen
      ? "fixed inset-0 z-40 flex min-h-[100dvh] flex-col justify-between bg-gradient-to-b from-emerald-50/95 via-white to-emerald-50/90 px-6 pb-12 pt-24 text-gray-800 shadow-[0_32px_120px_rgba(15,118,110,0.28)] backdrop-blur-xl md:static md:h-auto md:justify-center md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:text-gray-900 md:shadow-none"
      : "hidden md:flex"
  );

  const navLinkClassName = clsx(
    "rounded-2xl px-4 py-3 text-lg font-semibold tracking-tight text-emerald-900 transition-colors hover:bg-emerald-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
    "md:rounded-none md:px-0 md:py-0 md:text-sm md:font-medium md:text-gray-700 md:hover:bg-transparent md:hover:text-gray-900"
  );


  return (
    <header className="w-full bg-gradient-to-t from-teal-400 to-emerald-400 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="relative flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center" aria-label="Go to homepage">
            <img src={logo} alt="ToDoBeDo" className="h-10 w-auto md:h-12" />
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/20 p-2 text-gray-800 transition hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            ref={toggleButtonRef}
          >
           <span className="sr-only">Toggle navigation</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              {isMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <nav
            id="primary-navigation"
            ref={menuContainerRef}
            className={navClassName}
            aria-label="Primary navigation"
          >
            <div className="flex flex-1 flex-col gap-8 md:flex-row md:items-center md:gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <Link to="/" className={navLinkClassName}>
                  Home
                </Link>
                <Link to="/about" className={navLinkClassName}>
                  About
                </Link>
                <Link to="/projects" className={navLinkClassName}>
                  Projects
                </Link>
              </div>

          {user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 text-base font-semibold text-emerald-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 md:rounded-full md:bg-transparent md:p-0 md:text-sm md:font-medium md:text-gray-900 md:hover:bg-transparent"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User avatar"
                      className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md transition-transform duration-200 hover:scale-105 md:h-12 md:w-12"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-base font-bold text-emerald-900 transition-transform duration-200 hover:scale-105 md:h-12 md:w-12">
                      {user.displayName
                        ? user.displayName
                            .toUpperCase()
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                        : user?.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-emerald-950 md:hidden">{userDisplayName}</span>
                    <span className="text-xs text-emerald-700 md:hidden">View profile</span>
                  </div>
                </Link>
              ) : (
                 <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <Link
                    to="/register"
                    className="rounded-full border border-emerald-200/80 px-4 py-2 text-center text-sm font-semibold text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-white hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                  >
                    Sign in
                  </Link>
                </div>
              )}
             </div>

            {isMenuOpen ? (
              <p className="mt-10 max-w-xs text-sm text-emerald-800/80 md:hidden">
                Plan sprints, balance workloads, and keep the team in sync wherever you open ToDoBeDo.
              </p>
            ) : null}
          </nav>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}

import React from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isProjectTasksPage = /^\/projects\/[^/]+\/tasks/.test(location.pathname);
  const isAuthPage = ["/login", "/registration", "/forgot-password"].includes(
    location.pathname,
  );
  const mainClassName = isProjectTasksPage
    ? "flex-1 w-full px-3 pb-6 pt-4 sm:px-4 md:px-6"
    : isAuthPage
      ? "flex flex-1 w-full px-4 py-6 sm:px-6"
      : "flex-1 w-full max-w-6xl mx-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8";

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-emerald-600 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header />

      {/* Main Content */}
      <main id="main-content" className={mainClassName}>
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-teal-400 to-emerald-400 px-4 py-5 text-center text-sm text-gray-700">
        &copy; {new Date().getFullYear()} TODOBEDO. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;

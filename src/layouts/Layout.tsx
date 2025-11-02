import React from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isProjectTasksPage = /^\/projects\/[^/]+\/tasks/.test(location.pathname);
  const mainClassName = isProjectTasksPage
    ? "flex-1 w-full px-0 py-0"
    : "flex-1 w-full max-w-7xl mx-auto px-4 py-6";

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50 text-gray-900">
      <Header />

      {/* Main Content */}
      <main className={mainClassName}>
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-teal-400 to-emerald-400 py-4 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} TODOBEDO. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;

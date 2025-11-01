export default function AccessDenied() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700 shadow-sm transition-opacity duration-500 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-2">❌ Access denied</h3>
      <p className="text-sm">
        You don’t have permission to perform this action. Please contact the
        project owner if you need access.
      </p>
    </div>
  );
}

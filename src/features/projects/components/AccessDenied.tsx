

export default function AccessDenied() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700 shadow-sm transition-opacity duration-500 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-2">
        ❌ You don't have permission to perform this action
      </h3>
      <p className="text-sm">
        Contact the project owner to request access.
      </p>
    </div>
  );
}

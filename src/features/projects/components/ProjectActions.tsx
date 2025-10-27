type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export default function ProjectActions({ role }: { role: Role }) {
  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  const isMember = role === "MEMBER";
  const isViewer = role === "VIEWER";
  const canManage = isOwner || isAdmin;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm space-y-3 transition-opacity duration-500 animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-800">
        Управление проектом
      </h2>

      {isOwner && (
        <button className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition">
          Удалить проект
        </button>
      )}

      {canManage && (
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">
            Пригласить участника
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition">
            Редактировать проект
          </button>
        </div>
      )}

      {(isMember || isViewer) && (
        <p className="text-gray-600 italic">
          У вас права только на просмотр проекта.
        </p>
      )}
    </div>
  );
}

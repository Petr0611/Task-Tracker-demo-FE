import React from "react";

export default function AccessDenied() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700 shadow-sm transition-opacity duration-500 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-2">
        ❌ У вас нет прав на выполнение этого действия
      </h3>
      <p className="text-sm">
        Обратитесь к владельцу проекта, чтобы получить доступ.
      </p>
    </div>
  );
}

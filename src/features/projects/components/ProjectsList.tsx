import type { Project } from "../types";
// Иконки lucide-react заменены на инлайновые SVG для устранения внешней зависимости.

interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectsList({
  // Исправление: Установка значения по умолчанию [] для предотвращения ошибки 'Cannot read properties of undefined (reading 'length')'
  projects = [],
  onProjectClick,
}: ProjectsListProps) {
  if (projects.length === 0) return null;

  // Иконка для группы участников (Users)
  const UsersIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-gray-500"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  // Иконка для почты/приглашений (Mail)
  const MailIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-orange-500"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
    </svg>
  );

  // // Иконка для отдельного участника (User)
  // const UserIcon = (
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     viewBox="0 0 24 24"
  //     fill="none"
  //     stroke="currentColor"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     className="w-3 h-3 mr-1 text-gray-500"
  //   >
  //     <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  //     <circle cx="12" cy="7" r="4" />
  //   </svg>
  // );

  return (
    <section className="space-y-6 p-4 md:p-6 bg-gray-50 rounded-xl shadow-inner">
      {/* Обновленный заголовок */}
      <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">
        Ваши Проекты{" "}
        <span className="text-indigo-600">({projects.length})</span>
      </h2>

      <div className="flex flex-col gap-4">
        {projects.map((project) => {
          // Логирование убрано для более чистого продакшн-кода
          // console.log("Project members:", project.members);
          // console.log("Project invitations:", project.invitations);

          return (
            // Улучшенная карточка проекта
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:border-indigo-400 hover:shadow-xl transition duration-300 ease-in-out group relative"
            >
              <button
                type="button"
                onClick={() => onProjectClick?.(project)}
                // Используем отрицательный margin и padding, чтобы сделать всю карточку кликабельной
                className="block w-full text-left p-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-opacity-50 rounded-xl transition duration-150"
              >
                <div className="flex flex-col gap-2">
                  {/* Стильный заголовок */}
                  <span className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition">
                    {project.title}
                  </span>

                  {/* Описание */}
                  <span className="block text-sm text-gray-600">
                    {project.description}
                  </span>
                </div>

                {/* Блок с участниками и приглашениями */}
                <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                  {/* Члены проекта */}
                  {project.members && project.members.length > 0 && (
                    <div className="flex items-center gap-2">
                      {UsersIcon}
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Участники:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {project.members.map((member) => (
                          // Улучшенный бейдж участника
                          <span
                            key={member.id}
                            className="inline-flex items-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 px-3 py-1 shadow-sm border border-gray-200"
                          >
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-5 h-5 rounded-full object-cover mr-2"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white mr-2">
                                {member.name
                                  .toUpperCase()
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                            )}
                            {member.name} ({member.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Приглашённые */}
                  {project.invitations && project.invitations.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      {MailIcon}
                      <span className="text-sm font-medium text-orange-700 whitespace-nowrap">
                        Приглашения:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {project.invitations.map((inv, index) => (
                          // Улучшенный бейдж приглашения
                          <span
                            key={`${project.id}-inv-${index}`}
                            className="inline-flex items-center rounded-full bg-orange-50 text-xs font-medium text-orange-800 px-3 py-1 shadow-sm border border-orange-200"
                            title={`Статус: ${inv.collaboratorStatus}`}
                          >
                            {inv.email} — {inv.role} — {inv.collaboratorStatus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

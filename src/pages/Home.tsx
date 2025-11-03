import { Link } from "react-router-dom";

import "../css/Home.css";

type PreviewTagVariant = "focus" | "qa" | "blocked";

interface PreviewTask {
  title: string;
  tag?: {
    label: string;
    variant: PreviewTagVariant;
  };
}

interface PreviewColumn {
  title: string;
  tasks: PreviewTask[];
  emptyMessage?: string;
}

const previewColumns: PreviewColumn[] = [
  {
    title: "Backlog",
    tasks: [
      { title: "Collect launch feedback" },
      { title: "Outline onboarding tour", tag: { label: "Focus", variant: "focus" } },
    ],
  },
  {
    title: "In Progress",
    tasks: [
      { title: "Design marketing page" },
      { title: "Wire API integrations", tag: { label: "Blocked", variant: "blocked" } },
    ],
  },
  {
    title: "Review",
    tasks: [
      { title: "QA mobile flows", tag: { label: "QA", variant: "qa" } },
    ],
  },
  {
    title: "Done",
    tasks: [],
    emptyMessage: "Ready to celebrate!",
  },
];

export default function Home() {
  return (
    <main className="home-page" aria-labelledby="home-title">
      <section className="home-hero-card">
        <div className="home-hero-content">
          <span className="home-hero-badge">Launch-ready kanban</span>
          <h1 id="home-title" className="home-hero-title">
            A workspace to guide every sprint from idea to done
          </h1>
          <p className="home-hero-text">
            Shape your columns, track priorities, and give the team a calm view of what matters next. ToDoBeDo keeps your
            launch rhythm visible at every moment.
          </p>
          <div className="home-hero-actions">
            <Link to="/register" className="home-hero-action home-hero-action--primary">
              Create your account
            </Link>
            <Link to="/projects" className="home-hero-action home-hero-action--secondary">
              Browse projects
            </Link>
          </div>
        </div>

        <div className="home-board-preview" aria-label="Kanban board preview">
          <header className="home-board-header">
            <div className="home-board-heading">
              <span className="home-board-label">Current sprint</span>
              <h2 className="home-board-title">Product launch</h2>
            </div>
            <span className="home-board-status">Active</span>
          </header>

          <div className="home-board-columns">
            {previewColumns.map((column) => (
              <article key={column.title} className="home-board-column">
                <header>
                  <h3 className="home-board-column-title">{column.title}</h3>
                  <span className="home-board-column-meta">
                    {column.tasks.length > 0 ? `${column.tasks.length} task${column.tasks.length === 1 ? "" : "s"}` : "No tasks"}
                  </span>
                </header>

                <div className="home-board-tasks">
                  {column.tasks.map((task) => (
                    <div key={task.title} className="home-board-task">
                      <span className="home-board-task__title">{task.title}</span>
                      {task.tag ? (
                        <span className={`home-board-task__tag home-board-task__tag--${task.tag.variant}`}>
                          {task.tag.label}
                        </span>
                      ) : null}
                    </div>
                  ))}

                  {column.tasks.length === 0 && column.emptyMessage ? (
                    <div className="home-board-empty">{column.emptyMessage}</div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
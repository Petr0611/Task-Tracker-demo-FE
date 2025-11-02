import { Link } from "react-router-dom";

import "../css/About.css";

const highlights = [
  {
    title: "Live Kanban Board",
    description:
      "Drag tasks between columns and instantly spot where your team needs to focus next.",
  },
  {
    title: "Shared Alignment",
    description:
      "Set priorities, deadlines, and owners so everyone knows their next move without extra pings.",
  },
  {
    title: "Transparent Insights",
    description:
      "Track column and sprint metrics to launch with confidence from the very first iteration.",
  },
];

const kanbanFlow = [
  {
    label: "Capture ideas",
    detail:
      "Collect customer requests, hypotheses, and tasks in one shared backlog — we keep everything tidy without spreadsheets.",
  },
  {
    label: "Shape the flow",
    detail:
      "Split the board into Kanban stages, watch WIP limits, and help the team move forward without overload.",
  },
  {
    label: "Celebrate outcomes",
    detail:
      "Archive completed work and get velocity reports so you can plan the next release with clarity.",
  },
];

const launchTimeline = [
  {
    title: "Private testing",
    description:
      "Onboard the first teams and gather feedback to polish every critical user journey.",
  },
  {
    title: "Open beta",
    description:
      "Invite the waitlist and roll out integrations with trackers and team messengers.",
  },
  {
    title: "Platform 1.0",
    description:
      "Go public with pricing for startups and product teams, supporting your scale-up plans.",
  },
];

export default function About() {
  return (
    <main className="about-page" aria-labelledby="about-title">
      <section className="about-wrapper">
        <header className="about-header">
          <span className="about-label">Meet ToDoBeDo</span>
          <h1 id="about-title" className="about-title">
            A Kanban workspace built to launch your project with confidence
          </h1>
          <p className="about-description">
            ToDoBeDo brings tasks, statuses, and discussions into one board so your team can see progress in real time. We are
            preparing for our public launch and looking for the first teams ready to grow with us.
          </p>
          <Link to="/register" className="about-action">
            Register here for early access
          </Link>
        </header>

        <section className="about-section about-section--highlights" aria-label="Product highlights">
          <h2 className="about-section__title">Why ToDoBeDo is your launch partner</h2>
          <p className="about-section__subtitle">
            We focused on what early teams need most: a clean task flow, collaborative momentum, and guidance on bottlenecks.
          </p>
          <div className="about-highlight-grid">
            {highlights.map((item) => (
              <article className="about-highlight-card" key={item.title}>
                <h3 className="about-highlight-card__title">{item.title}</h3>
                <p className="about-highlight-card__text">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section about-section--flow" aria-label="How we organize the task flow">
          <h2 className="about-section__title">A Kanban flow without the overload</h2>
          <p className="about-section__subtitle">
            Every stage is visually clear — the team spots blockers and momentum instantly, building a steady delivery rhythm.
          </p>
          <div className="about-flow-steps">
            {kanbanFlow.map((moment) => (
              <div className="about-flow-step" key={moment.label}>
                <span className="about-flow-step__label">{moment.label}</span>
                <p className="about-flow-step__detail">{moment.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section about-section--timeline" aria-label="Launch milestones">
          <h2 className="about-section__title">Our launch roadmap</h2>
          <p className="about-section__subtitle">
            Here is what comes next. Join us early and infuse your experience directly into the product.
          </p>
          <ol className="about-timeline">
            {launchTimeline.map((stage, index) => (
              <li className="about-timeline-card" key={stage.title}>
                <span className="about-timeline-card__badge">{index + 1}</span>
                <div className="about-timeline-card__content">
                  <h3 className="about-timeline-card__title">{stage.title}</h3>
                  <p className="about-timeline-card__text">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="about-footer">
          <p className="about-footer__note">
            Write to us, tell us about your current workflow, and get personal onboarding as soon as we open the doors.
          </p>
          <a className="about-footer__link" href="mailto:team@10steel.io">
            team@10steel.io
          </a>
        </footer>
      </section>
    </main>
  );
}
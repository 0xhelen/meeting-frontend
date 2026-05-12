import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";

const FEATURES = [
  {
    id: "invite",
    kicker: "Access",
    title: "Invite-only",
    body: "There is no public job list on this page. You reach an application through a link we send you—aligned with a specific role or invitation.",
  },
  {
    id: "apply",
    kicker: "Application",
    title: "Structured responses",
    body: "Answer role-specific questions in one flow so we can review your experience and how you approach the work—not only your résumé.",
  },
  {
    id: "video",
    kicker: "Optional step",
    title: "Video introduction",
    body: "When requested, you can record a short introduction in the browser. It helps us connect a voice and presence to your written answers.",
  },
];

const BEFORE_YOU_BEGIN = [
  "Use a recent version of Chrome or Edge for the most reliable camera and microphone support.",
  "When your browser asks, allow camera and microphone for this site—you can change this later in the address bar lock icon.",
  "For video, pick a quiet, well-lit spot and a stable connection so your recording comes through clearly.",
];

export default function JobsHome() {
  return (
    <>
      <SiteHeader
        eyebrow="Candidate portal"
        title="Welcome"
        subtitle="Apply through the link we shared with you—this site explains how the process works."
      />
      <main id="main-content" className="main-panel home-page" tabIndex={-1}>
        <div className="home-stack">
          <section className="home-hero-card" aria-labelledby="home-lede-heading">
            <p id="home-lede-heading" className="home-hero-card__kicker">
              What this site is for
            </p>
            <p className="home-lede">
              This portal is part of our hiring workflow. We use it to collect applications, ask targeted questions, and
              sometimes invite a brief video introduction—so we get a fuller picture of who you are and how you work.
            </p>
          </section>

          <section className="home-section" aria-labelledby="home-features-title">
            <h2 id="home-features-title" className="home-section__title">
              How we use it
            </h2>
            <p className="home-section__lead">
              Three pieces fit together: your entry point, your written application, and an optional recording when we
              ask for it.
            </p>
            <ul className="home-feature-grid">
              {FEATURES.map((f) => (
                <li key={f.id} className="home-feature-card">
                  <p className="home-feature-card__kicker">{f.kicker}</p>
                  <h3 className="home-feature-card__title">{f.title}</h3>
                  <p className="home-feature-card__body">{f.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="home-section home-section--checklist" aria-labelledby="home-checklist-title">
            <h2 id="home-checklist-title" className="home-section__title">
              Before you begin
            </h2>
            <p className="home-section__lead">
              A quick checklist so technical hiccups don&apos;t get in the way of your answers.
            </p>
            <ul className="home-checklist">
              {BEFORE_YOU_BEGIN.map((item) => (
                <li key={item} className="home-checklist__item">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <p className="home-footnote">
            If you were sent here by mistake, or you need an accommodation or alternative format, reach out through the
            same channel that shared your application link—we&apos;re happy to help.
          </p>
        </div>
      </main>
    </>
  );
}

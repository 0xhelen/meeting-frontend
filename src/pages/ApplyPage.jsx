import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchInviteQuestions, fetchJobQuestions, logApplyOpen, submitApplication } from "../api.js";
import VideoIntro from "../components/VideoIntro.jsx";
import RichTextAnswer from "../components/RichTextAnswer.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { htmlToPlainText } from "../utils/richText.js";

export default function ApplyPage() {
  const { jobId, inviteToken } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [phase, setPhase] = useState("contact");
  const [contact, setContact] = useState({ fullName: "", email: "", linkedInUrl: "" });
  const [contactErrors, setContactErrors] = useState({});
  const [answers, setAnswers] = useState({});
  const [wizardStep, setWizardStep] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  useEffect(() => {
    const openKey = inviteToken ? `invite:${inviteToken}` : jobId;
    if (!openKey) return;
    logApplyOpen({ kind: "apply", jobKey: openKey }).catch(() => {});
  }, [jobId, inviteToken]);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    const p = inviteToken ? fetchInviteQuestions(inviteToken) : fetchJobQuestions(jobId);
    p.then((c) => {
      if (!cancelled) {
        console.log("[ApplyPage] cameraEnabled from server:", c?.cameraEnabled);
        setConfig(c);
      }
    }).catch((e) => {
      if (!cancelled) setLoadError(e.message || "Could not load application");
    });
    return () => {
      cancelled = true;
    };
  }, [jobId, inviteToken]);

  const labels = useMemo(() => {
    const steps = Array.isArray(config?.steps) ? config.steps : [];
    const stepTitles = steps.map((s) => s?.title || "");
    const videoTitle = config?.video?.title || "Introduction video";
    return [...stepTitles, videoTitle];
  }, [config]);
  const totalWizardSteps = 6;
  const showSubmit = phase === "wizard" && wizardStep === 5;

  const validateContact = () => {
    const err = {};
    if (!contact.fullName.trim()) err.fullName = "Name is required.";
    if (!contact.email.trim()) err.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) err.email = "Enter a valid email.";
    if (!contact.linkedInUrl.trim()) err.linkedInUrl = "LinkedIn URL is required.";
    setContactErrors(err);
    return Object.keys(err).length === 0;
  };

  const beginApplication = (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    setPhase("wizard");
    setWizardStep(0);
  };

  const validateAnswerStep = () => {
    if (!config || wizardStep >= 5) return true;
    const step = config.steps[wizardStep];
    const v = htmlToPlainText(answers[step.id] || "");
    return v.length > 0;
  };

  const goNext = () => {
    setSubmitError("");
    const last = 5;
    if (wizardStep >= last) return;
    if (!validateAnswerStep()) {
      setSubmitError("Please enter your response before continuing.");
      return;
    }
    setWizardStep((s) => s + 1);
  };

  const goBack = () => {
    setSubmitError("");
    if (wizardStep > 0) setWizardStep((s) => s - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!videoBlob?.size) {
      setSubmitError("Please record your introduction video.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("jobId", config?.jobId || jobId || "");
      fd.append("fullName", contact.fullName.trim());
      fd.append("email", contact.email.trim());
      fd.append("linkedInUrl", contact.linkedInUrl.trim());
      fd.append("answers", JSON.stringify(answers));
      if (config?.inviteToken || inviteToken) {
        fd.append("inviteToken", String(config?.inviteToken || inviteToken));
      }
      const ext = videoBlob.type.includes("mp4") ? "mp4" : "webm";
      fd.append("video", videoBlob, `introduction.${ext}`);
      await submitApplication(fd);
      setDoneOpen(true);
      setVideoBlob(null);
    } catch (err) {
      setSubmitError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <>
        <SiteHeader eyebrow="Application" title="Something went wrong" subtitle={loadError} />
        <main id="main-content" className="main-panel main-panel--apply" tabIndex={-1}>
          <p className="panel-lead">
            <Link to="/">← Back to openings</Link>
          </p>
        </main>
      </>
    );
  }

  if (!config) {
    return (
      <>
        <SiteHeader eyebrow="Application" title="Loading…" subtitle="Please wait." />
        <main id="main-content" className="main-panel main-panel--apply" tabIndex={-1}>
          <p className="panel-lead">Loading application…</p>
        </main>
      </>
    );
  }

  const headerSubtitle = inviteToken ? `Invite · ${config.jobTitle}` : config.jobTitle;

  const answerSection =
    wizardStep < 5 ? (
      <section aria-labelledby={`q-${config.steps[wizardStep].id}`}>
        <h2 id={`q-${config.steps[wizardStep].id}`} className="panel-title">
          {config.steps[wizardStep].title}
        </h2>
        <div className="panel-lead panel-lead--rich" dangerouslySetInnerHTML={{ __html: config.steps[wizardStep].prompt }} />
        <div className="field">
          <label htmlFor={config.steps[wizardStep].id}>Your answer</label>
          <RichTextAnswer
            key={`${wizardStep}-${config.steps[wizardStep].id}`}
            id={config.steps[wizardStep].id}
            value={answers[config.steps[wizardStep].id] || ""}
            onChange={(h) => setAnswers((a) => ({ ...a, [config.steps[wizardStep].id]: h }))}
          />
          <span className="field-hint">Use the toolbar for bold, italic, underline, and lists.</span>
        </div>
      </section>
    ) : null;

  return (
    <>
      <SiteHeader
        className="site-header--apply"
        eyebrow="Application"
        title="Apply for this role"
        subtitle={headerSubtitle}
        actions={
          <button type="button" className="btn btn-secondary site-header__back" onClick={() => navigate("/")}>
            ← All openings
          </button>
        }
      />

      <main id="main-content" className="main-panel main-panel--apply" tabIndex={-1}>
        {phase === "contact" ? (
          <form className="application-form" onSubmit={beginApplication} noValidate>
            <h2 className="panel-title">Contact information</h2>
            <p className="panel-lead">
              Enter your details so we can reach you about this role. You will then answer five written questions and
              record a brief introduction video.
            </p>

            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={contact.fullName}
                onChange={(e) => setContact((c) => ({ ...c, fullName: e.target.value }))}
              />
              {contactErrors.fullName ? <p className="field-error">{contactErrors.fullName}</p> : null}
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
              {contactErrors.email ? <p className="field-error">{contactErrors.email}</p> : null}
            </div>

            <div className="field">
              <label htmlFor="linkedInUrl">LinkedIn profile URL</label>
              <input
                id="linkedInUrl"
                name="linkedInUrl"
                type="url"
                inputMode="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={contact.linkedInUrl}
                onChange={(e) => setContact((c) => ({ ...c, linkedInUrl: e.target.value }))}
              />
              <span className="field-hint">Copy the full URL from your browser address bar.</span>
              {contactErrors.linkedInUrl ? <p className="field-error">{contactErrors.linkedInUrl}</p> : null}
            </div>

            <footer className="form-actions form-actions--end">
              <button type="submit" className="btn btn-primary">
                Continue to questions
              </button>
            </footer>
          </form>
        ) : null}

        {phase === "wizard" ? (
          <form className="application-form" onSubmit={onSubmit}>
            <nav className="step-rail" aria-label="Application progress">
              <ol className="step-list">
                {Array.from({ length: totalWizardSteps }, (_, i) => {
                  const cls = `step-item ${wizardStep === i ? "is-current" : ""} ${wizardStep > i ? "is-complete" : ""}`;
                  return (
                    <li key={labels[i] || i} className={cls}>
                      <span className="step-num">{i + 1}</span>
                      <span className="step-label">{labels[i] || `Step ${i + 1}`}</span>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {answerSection}

            {wizardStep === 5 ? (
              <section aria-labelledby="video-title">
                <h2 id="video-title" className="panel-title">
                  {config.video.title}
                </h2>
                <p className="panel-lead">{config.video.instructions}</p>
                <VideoIntro videoBlob={videoBlob} onVideoBlobChange={setVideoBlob} cameraEnabled={config.cameraEnabled} />
              </section>
            ) : null}

            {submitError ? <p className="field-error">{submitError}</p> : null}

            <footer className="form-actions">
              <button type="button" className="btn btn-ghost" hidden={wizardStep === 0} onClick={goBack}>
                Back
              </button>
              <div className="form-actions__push">
                {!showSubmit ? (
                  <button type="button" className="btn btn-primary" onClick={goNext}>
                    {wizardStep === 4 ? "Continue to video" : "Continue"}
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit application"}
                  </button>
                )}
              </div>
            </footer>
          </form>
        ) : null}
      </main>

      <div className={`modal ${doneOpen ? "" : "is-hidden"}`} role="dialog" aria-modal="true" aria-labelledby="done-title">
        <div className="modal-backdrop" onClick={() => setDoneOpen(false)} aria-hidden="true" />
        <div className="modal-card">
          <div className="modal-ornament" aria-hidden="true">
            ✓
          </div>
          <h2 id="done-title" className="modal-title">
            Application submitted
          </h2>
          <p className="modal-body">
            Thank you. We have received your application and will review it carefully. If there is a fit, we will contact you using the email you provided.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setDoneOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

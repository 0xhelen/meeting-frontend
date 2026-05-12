export default function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}) {
  const safeVariant = ["info", "success", "warning", "error"].includes(variant) ? variant : "info";
  const role = safeVariant === "error" || safeVariant === "warning" ? "alert" : "status";

  return (
    <div className={`alert alert--${safeVariant} ${className}`.trim()} role={role}>
      <div className="alert__inner">
        <div className="alert__main">
          {title ? <p className="alert__title">{title}</p> : null}
          <div className="alert__content">{children}</div>
        </div>
        {typeof onDismiss == "function" ? (
          <button type="button" className="alert__dismiss" onClick={onDismiss} aria-label="Dismiss alert">
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}

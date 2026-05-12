export default function SiteHeader({ className = "", eyebrow, title, subtitle, actions = null }) {
  return (
    <header className={`site-header ${className}`.trim()}>
      <div className="site-header__inner">
        <div className="site-header__copy">
          {eyebrow ? <p className="site-header__eyebrow">{eyebrow}</p> : null}
          <h1 className="site-header__title">{title}</h1>
          {subtitle ? <p className="site-header__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="site-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";

function isCoarsePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function isNarrow() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 900;
}

export default function MobileBlockModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setOpen(isNarrow() && isCoarsePointer());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!open) return null;

  return (
    <div className="mobile-block" role="alertdialog" aria-modal="true" aria-labelledby="mb-title">
      <div className="mobile-block__card">
        <h2 id="mb-title" className="mobile-block__title">
          This site is not working good on mobile devices.
        </h2>
        <p className="mobile-block__body">Please use desktop or tablet browsers to apply.</p>
      </div>
    </div>
  );
}

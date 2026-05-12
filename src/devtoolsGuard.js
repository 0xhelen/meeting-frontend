if (import.meta.env.PROD) {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i"))) {
        e.preventDefault();
      }
    },
    true
  );
}

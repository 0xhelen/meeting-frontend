export function htmlToPlainText(html) {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").replace(/\u00a0/g, " ").trim();
}

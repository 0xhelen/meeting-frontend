import { useCallback, useEffect, useRef } from "react";

function exec(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

export default function RichTextAnswer({ id, value, onChange }) {
  const ref = useRef(null);
  const syncing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || syncing.current) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    syncing.current = true;
    onChange?.(el.innerHTML);
    queueMicrotask(() => {
      syncing.current = false;
    });
  }, [onChange]);

  const onPaste = useCallback(
    (e) => {
      e.preventDefault();
      const t = e.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertText", false, t);
      emit();
    },
    [emit]
  );

  return (
    <div className="rich-text">
      <div className="rich-text__toolbar" role="toolbar" aria-label="Text formatting">
        <button type="button" className="rich-text__btn" onClick={() => exec("bold")}>
          Bold
        </button>
        <button type="button" className="rich-text__btn" onClick={() => exec("italic")}>
          Italic
        </button>
        <button type="button" className="rich-text__btn" onClick={() => exec("underline")}>
          Underline
        </button>
        <button type="button" className="rich-text__btn" onClick={() => exec("insertUnorderedList")}>
          List
        </button>
      </div>
      <div
        ref={ref}
        id={id}
        className="rich-text__editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
      />
    </div>
  );
}

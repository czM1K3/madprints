"use client";

import { cloneElement, useId, type FC, type ReactElement } from "react";

type FieldProps = {
  label: string;
  hint?: string | null;
  error?: string | null;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
};

/** Wires a visible label, hint and error message to a single form control. */
export const Field: FC<FieldProps> = ({ label, hint, error, children }) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span id={hintId} className="hint">{hint}</span>}
      {cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
};

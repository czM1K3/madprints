"use client";

import React, { type FC } from "react";
import { Field } from "~/app/_components/ui/field";

export type ParameterType = "Number" | "Boolean" | "String";

export type ParameterInput = {
  id: number;
  name: string;
  datatype: ParameterType;
  defaultValue: string;
  description: string | null;
};

type ParameterInputProps = {
  input: ParameterInput;
  value: string;
  onChange: (value: string) => void;
};

export const ParameterInputField: FC<ParameterInputProps> = ({ input, value, onChange }) => {
  switch (input.datatype) {
    case "String":
      return (
        <Field label={input.name} hint={input.description}>
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "Number":
      return (
        <Field label={input.name} hint={input.description}>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? "0" : e.target.value)}
          />
        </Field>
      );
    case "Boolean":
      return <BooleanField input={input} value={value} onChange={onChange} />;
    default:
      return <p role="alert">Cannot display parameter “{input.name}”.</p>;
  }
};

const BooleanField: FC<ParameterInputProps> = ({ input, value, onChange }) => (
  <label className="check">
    <input
      type="checkbox"
      checked={value === "true"}
      onChange={(e) => onChange(e.target.checked ? "true" : "false")}
    />
    <span>
      <strong>{input.name}</strong>
      {input.description && <span className="hint" style={{ display: "block" }}>{input.description}</span>}
    </span>
  </label>
);

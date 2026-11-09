"use client";

import React, { type Dispatch, type SetStateAction, type FC, useState } from "react";
import { ModelGenerator } from "~/app/models/[id]/_components/generator";
import { type ParameterType, type ParameterInput, ParameterInputField } from "~/app/models/[id]/_components/input";
import { getRandomIntPositive } from "~/helpers/random";
import Editor from "~/app/_components/common/editor";
import { Modal } from "~/app/_components/ui/modal";
import { Field } from "~/app/_components/ui/field";

type ModelIterationProps = {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  parameters: ParameterInput[];
  setParameters: Dispatch<SetStateAction<ParameterInput[]>>;
  setTimeToGenerate: Dispatch<SetStateAction<number | null>>;
  createScreenshot?: () => Promise<void>;
};

const DEFAULTS: Record<ParameterType, string> = { Boolean: "false", Number: "0", String: "" };

export const ModelIteration: FC<ModelIterationProps> = ({ code, setCode, parameters, setParameters, createScreenshot, setTimeToGenerate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<ParameterType>("Number");
  const [name, setName] = useState("");
  const [defaultValue, setDefaultValue] = useState(DEFAULTS.Number);
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const changeType = (t: ParameterType) => {
    setType(t);
    setDefaultValue(DEFAULTS[t]);
  };

  const closeAdd = () => {
    setShowAdd(false);
    setNameError(null);
  };

  const addParameter = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setNameError("Enter a parameter name.");
      return;
    }
    if (parameters.some((p) => p.name.toUpperCase() === trimmed.toUpperCase())) {
      setNameError(`Parameter “${trimmed}” already exists.`);
      return;
    }
    setParameters((p) => [...p, {
      datatype: type,
      defaultValue,
      description: description || null,
      id: getRandomIntPositive(),
      name: trimmed,
    }]);
    setName("");
    changeType("Number");
    setDescription("");
    closeAdd();
  };

  return (
    <section className="card stack" aria-labelledby="iteration-heading">
      <h2 id="iteration-heading">Model version</h2>

      <div className="field">
        <span className="label">OpenSCAD code</span>
        <Editor code={code} setCode={setCode} langauge="openscad" label="OpenSCAD code" height="50vh" />
      </div>

      <div className="stack-sm">
        <h3>Parameters</h3>
        {parameters.length === 0 ? (
          <p className="muted">No parameters yet. Parameters let viewers customize the model.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="visually-hidden">Model parameters</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((parameter, i) => (
                  <tr key={parameter.id ?? i}>
                    <th scope="row">{parameter.name}</th>
                    <td>{parameter.datatype}</td>
                    <td>{parameter.defaultValue}</td>
                    <td>{parameter.description}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => setParameters((p) => p.filter((_, idx) => idx !== i))}
                      >
                        Delete<span className="visually-hidden"> parameter {parameter.name}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(true)}>Add parameter</button>
        </div>
      </div>

      <Modal open={showAdd} onClose={closeAdd} title="Add parameter">
        {/* Not a <form>: this dialog lives inside the page form and nested forms are invalid HTML. */}
        <div
          className="stack"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "checkbox") {
              e.preventDefault();
              addParameter();
            }
          }}
        >
          <Field label="Type">
            <select value={type} onChange={(e) => changeType(e.target.value as ParameterType)}>
              <option>Number</option>
              <option>String</option>
              <option>Boolean</option>
            </select>
          </Field>
          <Field label="Name (must match the variable in your code)" error={nameError}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </Field>
          <ParameterInputField
            input={{ id: 1, datatype: type, name: "Default value", defaultValue: "", description: null }}
            value={defaultValue}
            onChange={setDefaultValue}
          />
          <Field label="Description (optional)">
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="row">
            <button type="button" className="btn" onClick={addParameter}>Add parameter</button>
            <button type="button" className="btn btn-secondary" onClick={closeAdd}>Cancel</button>
          </div>
        </div>
      </Modal>

      <div className="stack-sm">
        <h3>Preview</h3>
        <ModelGenerator
          iterations={[{
            code,
            createdAt: new Date(),
            id: 1,
            parameters,
            timeToGenerate: null,
            number: 1,
          }]}
          createScreenshot={createScreenshot}
          setTimeToGenerate={setTimeToGenerate}
        />
      </div>
    </section>
  );
};

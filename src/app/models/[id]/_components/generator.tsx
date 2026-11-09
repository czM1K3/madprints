"use client";

import React, { type Dispatch, type SetStateAction, useEffect, useState, type FC } from "react";
import { StlViewer } from "react-stl-viewer";
import { ParameterInputField, type ParameterInput } from "./input";
import { ShowCode } from "./showCode";
import { msToString } from "~/helpers/time";
import { useToast } from "~/app/_components/ui/toast";
import { Modal } from "~/app/_components/ui/modal";
import { Field } from "~/app/_components/ui/field";

type Iteration = {
  id: number;
  number: number;
  code: string;
  createdAt: Date;
  timeToGenerate: number | null;
  parameters: ParameterInput[];
};

type ModelGeneratorProps = {
  iterations: Iteration[];
  createScreenshot?: () => Promise<void>;
  setTimeToGenerate?: Dispatch<SetStateAction<number | null>>;
};

type GeneratorOutput = {
  data: Uint8Array<ArrayBuffer> | null;
  outputs: string[];
  time: number | null;
};

declare global {
  interface Window {
    openscad?: Worker;
  }
}

const toOpenscadValue = (parameter: ParameterInput, value: string) => {
  switch (parameter.datatype) {
    case "Number":
      return value;
    case "Boolean":
      return value === "true" ? "true" : "false";
    case "String":
      return `"${value.replaceAll('"', '\\"')}"`;
  }
};

export const ModelGenerator: FC<ModelGeneratorProps> = ({ iterations, createScreenshot, setTimeToGenerate }) => {
  const notify = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Only values the user changed; everything else falls back to the default value.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [showOutputs, setShowOutputs] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  const iteration = iterations.find((i) => i.id === selectedId) ?? iterations[0];

  useEffect(() => {
    const worker = window.openscad;
    if (!worker) return;
    worker.onmessage = (message: MessageEvent<GeneratorOutput>) => {
      setOutputs(message.data.outputs);
      setIsLoading(false);
      setTime(message.data.time);
      setTimeToGenerate?.(message.data.time);
      if (message.data.data) {
        const blob = new Blob([message.data.data], { type: "application/octet-stream" });
        setModelUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setStatus("Model generated.");
      } else {
        setModelUrl(null);
        setStatus("Model failed to generate. Check the logs.");
        notify({ title: "Failed to generate", message: "Model failed to generate, check the logs.", variant: "error" });
        setShowOutputs(true);
      }
    };
    return () => {
      worker.onmessage = null;
    };
  }, [setTimeToGenerate, notify]);

  if (!iteration) return null;

  const valueOf = (p: ParameterInput) => overrides[p.name] ?? p.defaultValue;

  const generate = () => {
    if (!window.openscad) {
      notify({ title: "Generator not ready", message: "The OpenSCAD engine is still loading. Try again in a moment.", variant: "error" });
      return;
    }
    const args = iteration.parameters.flatMap((p) => ["-D", `${p.name}=${toOpenscadValue(p, valueOf(p))}`]);
    setIsLoading(true);
    setStatus("Generating model…");
    setEstimatedTime(iteration.timeToGenerate);
    window.openscad.postMessage({ code: iteration.code, parameters: args });
  };

  const download = () => {
    if (!modelUrl) return;
    const link = document.createElement("a");
    link.href = modelUrl;
    link.download = "model.stl";
    document.body.append(link);
    link.click();
    link.remove();
  };

  return (
    <div className="card stack">
      {iterations.length > 1 && (
        <Field label="Version">
          <select
            value={iteration.id}
            onChange={(e) => { setSelectedId(Number(e.target.value)); setOverrides({}); }}
          >
            {iterations.map((i) => (
              <option key={i.id} value={i.id}>
                Version {i.number} — {i.createdAt.toLocaleDateString("en-us")}
              </option>
            ))}
          </select>
        </Field>
      )}

      {iteration.parameters.length > 0 && (
        <fieldset className="stack">
          <legend><h3>Parameters</h3></legend>
          {iteration.parameters.map((parameter) => (
            <ParameterInputField
              key={parameter.id}
              input={parameter}
              value={valueOf(parameter)}
              onChange={(value) => setOverrides((o) => ({ ...o, [parameter.name]: value }))}
            />
          ))}
          <div>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setOverrides({})}>
              Reset to default values
            </button>
          </div>
        </fieldset>
      )}

      <div className="row">
        <button type="button" className="btn" onClick={generate} disabled={isLoading} aria-describedby="est-time">
          {isLoading ? "Generating…" : "Generate"}
        </button>
        <span id="est-time" className="muted small">
          {iteration.timeToGenerate ? `Estimated time: ${msToString(iteration.timeToGenerate)}` : ""}
        </span>
        <ShowCode code={iteration.code} />
      </div>

      <p role="status" className={status ? "muted" : "visually-hidden"}>{status}</p>

      <div className="viewer" role="group" aria-label="3D preview. Drag to rotate, scroll to zoom.">
        {modelUrl ? (
          <StlViewer style={{ height: "100%", width: "100%" }} orbitControls shadows url={modelUrl} />
        ) : (
          <div className="empty muted">Press “Generate” to see the model here.</div>
        )}
        {isLoading && (
          <div className="viewer-busy" aria-hidden="true">
            <div className="spinner" />
            {estimatedTime !== null && <span>Estimated time: {msToString(estimatedTime)}</span>}
          </div>
        )}
      </div>

      <div className="row">
        {createScreenshot && (
          <button type="button" className="btn btn-secondary" onClick={() => void createScreenshot()} disabled={!modelUrl}>
            Add screenshot to images
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={() => setShowOutputs(true)} disabled={outputs.length === 0}>
          Show logs
        </button>
        <button type="button" className="btn btn-secondary" onClick={download} disabled={!modelUrl}>
          Download STL
        </button>
      </div>

      <Modal open={showOutputs} onClose={() => setShowOutputs(false)} title="Logs" wide>
        {time !== null && <p>Time taken: {msToString(time)}</p>}
        <pre className="log">{outputs.join("\n")}</pre>
      </Modal>
    </div>
  );
};

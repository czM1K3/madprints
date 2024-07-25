"use client";

import React, { useState, type FC } from "react";
import { ModelBase } from "./modelBase";
import { ModelIteration } from "./modelIteration";
import { type ParameterInput } from "~/app/models/[id]/_components/input";

export const CreateModel: FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [parameters, setParameters] = useState<ParameterInput[]>([]);
  return (
    <>
      <ModelBase title={title} setTitle={setTitle} description={description} setDescription={setDescription} />
      <ModelIteration code={code} setCode={setCode} parameters={parameters} setParameters={setParameters} />
    </>
  );
}

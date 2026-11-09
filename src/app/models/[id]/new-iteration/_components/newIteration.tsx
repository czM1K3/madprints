"use client";

import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { api } from "~/trpc/react";
import { type ParameterInput } from "../../_components/input";
import { ModelIteration } from "~/app/create/_components/modelIteration";
import { useToast } from "~/app/_components/ui/toast";

type NewIterationProps = {
  modelId: string;
  lastCode: string;
  lastParameters: ParameterInput[];
};

export const NewIteration: FC<NewIterationProps> = ({ lastParameters, modelId, lastCode }) => {
  const notify = useToast();
  const [code, setCode] = useState(lastCode);
  const [parameters, setParameters] = useState<ParameterInput[]>(lastParameters);
  const [timeToGenerate, setTimeToGenerate] = useState<null | number>(null);

  const mutation = api.model.newIteration.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSending(true);
      await mutation.mutateAsync({ id: modelId, code, parameters, timeToGenerate });
      notify({ title: "New version created" });
      router.push(`/models/${modelId}`);
    } catch {
      notify({ title: "Something went wrong", message: "The new version could not be created.", variant: "error" });
      setIsSending(false);
    }
  };

  return (
    <form className="stack" onSubmit={(e) => void submit(e)}>
      <h1>Add new version</h1>
      <ModelIteration
        code={code} setCode={setCode}
        parameters={parameters} setParameters={setParameters}
        setTimeToGenerate={setTimeToGenerate}
      />
      <div>
        <button type="submit" className="btn" disabled={isSending}>
          {isSending ? "Creating…" : "Create version"}
        </button>
      </div>
    </form>
  );
};

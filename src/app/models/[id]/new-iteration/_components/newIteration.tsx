"use client";

import { Box, Button, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { api } from "~/trpc/react";
import { type ParameterInput } from "../../_components/input";
import { ModelIteration } from "~/app/create/_components/modelIteration";

type NewIterationProps = {
  modelId: string;
  lastCode: string;
  lastParameters: ParameterInput[];
};

export const NewIteration: FC<NewIterationProps> = ({ lastParameters, modelId, lastCode }) => {
  const [code, setCode] = useState(lastCode);
  const [parameters, setParameters] = useState<ParameterInput[]>(lastParameters);
  const [timeToGenerate, setTimeToGenerate] = useState<null | number>(null);

  const mutation = api.model.newIteration.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    try {
      setIsSending(true);
      await mutation.mutateAsync({
        id: modelId,
        code,
        parameters,
      });
      notifications.show({
        title: "Success",
        message: "Model was successfully edited"
      });
      router.push(`/models/${modelId}`);
    } catch (e) {
      notifications.show({
        title: "Something went wrong",
        message: "Creating was not successfull",
        color: "red"
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Box pos="relative">
      <ModelIteration code={code} setCode={setCode} parameters={parameters} setParameters={setParameters} setTimeToGenerate={setTimeToGenerate} />
      <Button onClick={() => submit()}>Create</Button>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}

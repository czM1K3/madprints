"use client";

import React, { useState, type FC } from "react";
import { ModelBase } from "./modelBase";
import { ModelIteration } from "./modelIteration";
import { type ParameterInput } from "~/app/models/[id]/_components/input";
import { Box, Button, LoadingOverlay } from "@mantine/core";
import { api } from "~/trpc/react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export const CreateModel: FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [parameters, setParameters] = useState<ParameterInput[]>([]);

  const mutation = api.model.create.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    try {
      setIsSending(true);
      const res = await mutation.mutateAsync({
        title,
        description,
        code,
        parameters,
      });
      notifications.show({
        title: "Success",
        message: "Model was successfully created"
      });
      router.push(`/models/${res}`);
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
      <ModelBase title={title} setTitle={setTitle} description={description} setDescription={setDescription} />
      <ModelIteration code={code} setCode={setCode} parameters={parameters} setParameters={setParameters} />
      <Button onClick={() => submit()}>Create</Button>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}
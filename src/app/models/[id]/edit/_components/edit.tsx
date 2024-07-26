"use client";

import { Box, Button, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { ModelBase } from "~/app/create/_components/modelBase";
import { api } from "~/trpc/react";

type EditModeProps = {
  id: string;
  title: string;
  description: string;
};

export const EditModel: FC<EditModeProps> = ({ id, ...props}) => {
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);

  const mutation = api.model.edit.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    try {
      setIsSending(true);
      await mutation.mutateAsync({
        id,
        title,
        description,
      });
      notifications.show({
        title: "Success",
        message: "Model was successfully edited"
      });
      router.push(`/models/${id}`);
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
      <ModelBase isEditing title={title} setTitle={setTitle} description={description} setDescription={setDescription} />
      <Button onClick={() => submit()}>Update</Button>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}

"use client";

import { Box, Button, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { type Categories } from "~/app/_types/categories";
import { ModelBase } from "~/app/create/_components/modelBase";
import { api } from "~/trpc/react";

type EditModeProps = {
  id: string;
  title: string;
  description: string;
  category?: string;
  categories: Categories;
  images: string[];
};

export const EditModel: FC<EditModeProps> = ({ id, categories, images, ...props}) => {
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);
  const [category, setCategory] = useState(props.category ?? "");
  const [files, setFiles] = useState<File[] | null>(null);

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
        category: category || null,
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
      <ModelBase isEditing title={title} setTitle={setTitle} description={description} setDescription={setDescription} category={category} setCategory={setCategory} categories={categories} files={files} setFiles={setFiles} images={images} />
      <Button onClick={() => submit()}>Update</Button>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}

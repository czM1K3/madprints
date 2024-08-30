"use client";

import { Box, Button, Center, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { type Categories } from "~/app/_types/categories";
import { ModelBase } from "~/app/create/_components/modelBase";
import { api } from "~/trpc/react";
import axios from "axios";

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
      const res = await mutation.mutateAsync({
        id,
        title,
        description,
        category: category || null,
        images: files?.map((file) => file.name) ?? null,
      });
      if (files !== null && res.presignedUrls !== null) {
        for (const [i, file] of files.entries()) {
          await axios.put(res.presignedUrls[i]!, file);
        }
      }
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
      <Center>
        <Button mb="sm" onClick={() => submit()}>Update</Button>
      </Center>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}

"use client";

import React, { useState, type FC } from "react";
import { ModelBase } from "./modelBase";
import { ModelIteration } from "./modelIteration";
import { type ParameterInput } from "~/app/models/[id]/_components/input";
import { Box, Button, Center, LoadingOverlay } from "@mantine/core";
import { api } from "~/trpc/react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { type Categories } from "~/app/_types/categories";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

type CreateModelProps = {
  categories: Categories;
};

export const CreateModel: FC<CreateModelProps> = ({ categories }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [parameters, setParameters] = useState<ParameterInput[]>([]);
  const [files, setFiles] = useState<File[] | null>([]);
  const [timeToGenerate, setTimeToGenerate] = useState<null | number>(null);

  const mutation = api.model.create.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    try {
      if (files === null) return;
      setIsSending(true);
      const res = await mutation.mutateAsync({
        title,
        description,
        code,
        category: category || null,
        parameters,
        images: files.map((file) => file.name),
      });
      for (const [i, file] of files.entries()) {
        await axios.put(res.presignedUrls[i]!, file);
      }
      notifications.show({
        title: "Success",
        message: "Model was successfully created"
      });
      router.push(`/models/${res.id}`);
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

  const screenshot = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-engine^='three.js']");
    if (!canvas) {
      notifications.show({
        title: "Something went wrong",
        message: "Unable to find preview",
        color: "red"
      });
      return;
    }
    const base64 = canvas.toDataURL("image/png");
    const data = await fetch(base64);
    const blob = await data.blob();
    const file = new File([blob], `${uuidv4()}.png`, {
      type: "image/png",
    });
    setFiles((files) => [...(files ?? []), file]);
    notifications.show({
      title: "Success",
      message: "Added screenshot successfully"
    });
  };

  return (
    <Box pos="relative">
      <ModelBase
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        categories={categories}
        category={category}
        setCategory={setCategory}
        files={files}
        setFiles={setFiles}
        images={[]}
      />
      <ModelIteration
        code={code}
        setCode={setCode}
        parameters={parameters}
        setParameters={setParameters}
        createScreenshot={screenshot}
        setTimeToGenerate={setTimeToGenerate}
      />
      <Center>
        <Button mb="sm" onClick={() => submit()}>Create</Button>
      </Center>
      <LoadingOverlay visible={isSending} zIndex={99} overlayProps={{ radius: "sm", blur: 2 }} />
    </Box>
  );
}

"use client";

import React, { useState, type FC } from "react";
import { ModelBase } from "./modelBase";
import { ModelIteration } from "./modelIteration";
import { type ParameterInput } from "~/app/models/[id]/_components/input";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { type Categories } from "~/app/_types/categories";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "~/app/_components/ui/toast";

type CreateModelProps = {
  categories: Categories;
};

export const CreateModel: FC<CreateModelProps> = ({ categories }) => {
  const notify = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [parameters, setParameters] = useState<ParameterInput[]>([]);
  const [files, setFiles] = useState<File[] | null>([]);
  const [timeToGenerate, setTimeToGenerate] = useState<null | number>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const mutation = api.model.create.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files === null) return;
    const tErr = title.trim() ? null : "Enter a model name.";
    const iErr = files.length === 0 ? "Add at least one image. You can also take a screenshot from the preview below." : null;
    setTitleError(tErr);
    setImagesError(iErr);
    if (tErr ?? iErr) {
      notify({ title: "Please fix the highlighted fields", variant: "error" });
      return;
    }
    try {
      setIsSending(true);
      const res = await mutation.mutateAsync({
        title: title.trim(),
        description,
        code,
        category: category === 0 ? null : category,
        parameters,
        images: files.map((file) => file.name),
        timeToGenerate,
      });
      for (const [i, file] of files.entries()) {
        await axios.put(res.presignedUrls[i]!, file);
      }
      notify({ title: "Model created" });
      router.push(`/models/${res.id}`);
    } catch {
      notify({ title: "Something went wrong", message: "The model could not be created.", variant: "error" });
      setIsSending(false);
    }
  };

  const screenshot = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-engine^='three.js']");
    if (!canvas) {
      notify({ title: "Something went wrong", message: "Unable to find the preview.", variant: "error" });
      return;
    }
    const blob = await (await fetch(canvas.toDataURL("image/png"))).blob();
    const file = new File([blob], `${uuidv4()}.png`, { type: "image/png" });
    setFiles((files) => [...(files ?? []), file]);
    notify({ title: "Screenshot added to images" });
  };

  return (
    <form className="stack" onSubmit={(e) => void submit(e)} noValidate>
      <h1>Create new model</h1>
      <ModelBase
        title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        categories={categories} category={category} setCategory={setCategory}
        files={files} setFiles={setFiles} images={[]}
        titleError={titleError} imagesError={imagesError}
      />
      <ModelIteration
        code={code} setCode={setCode}
        parameters={parameters} setParameters={setParameters}
        createScreenshot={screenshot}
        setTimeToGenerate={setTimeToGenerate}
      />
      <div>
        <button type="submit" className="btn" disabled={isSending}>
          {isSending ? "Creating…" : "Create model"}
        </button>
      </div>
    </form>
  );
};

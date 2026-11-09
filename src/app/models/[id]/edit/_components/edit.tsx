"use client";

import { useRouter } from "next/navigation";
import React, { useState, type FC } from "react";
import { type Categories } from "~/app/_types/categories";
import { ModelBase } from "~/app/create/_components/modelBase";
import { api } from "~/trpc/react";
import axios from "axios";
import { useToast } from "~/app/_components/ui/toast";

type EditModeProps = {
  id: string;
  title: string;
  description: string;
  category: number | null;
  categories: Categories;
  images: string[];
};

export const EditModel: FC<EditModeProps> = ({ id, categories, images, ...props }) => {
  const notify = useToast();
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);
  const [category, setCategory] = useState<number | null>(props.category ?? 0);
  const [files, setFiles] = useState<File[] | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const mutation = api.model.edit.useMutation();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tErr = title.trim() ? null : "Enter a model name.";
    const iErr = files !== null && files.length === 0 ? "Keep at least one image." : null;
    setTitleError(tErr);
    setImagesError(iErr);
    if (tErr ?? iErr) {
      notify({ title: "Please fix the highlighted fields", variant: "error" });
      return;
    }
    try {
      setIsSending(true);
      const res = await mutation.mutateAsync({
        id,
        title: title.trim(),
        description,
        category,
        images: files?.map((file) => file.name) ?? null,
      });
      if (files !== null && res.presignedUrls !== null) {
        for (const [i, file] of files.entries()) {
          await axios.put(res.presignedUrls[i]!, file);
        }
      }
      notify({ title: "Model updated" });
      router.push(`/models/${id}`);
    } catch {
      notify({ title: "Something went wrong", message: "The model could not be updated.", variant: "error" });
      setIsSending(false);
    }
  };

  return (
    <form className="stack" onSubmit={(e) => void submit(e)} noValidate>
      <h1>Edit model</h1>
      <ModelBase
        isEditing title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        category={category} setCategory={setCategory}
        categories={categories} files={files} setFiles={setFiles} images={images}
        titleError={titleError} imagesError={imagesError}
      />
      <div>
        <button type="submit" className="btn" disabled={isSending}>
          {isSending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

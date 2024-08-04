import { Select, Textarea, TextInput, Title } from "@mantine/core";
import React, { type Dispatch, type SetStateAction, type FC } from "react";
import { type Categories } from "~/app/_types/categories";

type ModelBaseProps = {
  isEditing?: true,
  title: string
  setTitle: Dispatch<SetStateAction<string>>;
  description: string
  setDescription: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  categories: Categories;
};

export const ModelBase: FC<ModelBaseProps> = ({ isEditing, title, setTitle, description, setDescription, category, setCategory, categories }) => {
  return (
    <>
      <Title>{isEditing ? "Edit existing model" : "Create new model"}</Title>
      <TextInput
        label="Model name"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        multiple
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        autosize
        minRows={6}
        maxRows={12}
      />
      <Select
        label="Category"
        placeholder="Pick category"
        data={categories.names}
        value={categories.keyName[category]}
        onChange={(v) => v ? setCategory(categories.nameKey[v] ?? "") : "" }
      />
    </>
  );
}

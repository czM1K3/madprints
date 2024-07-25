import { Textarea, TextInput, Title } from "@mantine/core";
import React, { type Dispatch, type SetStateAction, type FC } from "react";

type ModelBaseProps = {
  isEditing?: true,
  title: string
  setTitle: Dispatch<SetStateAction<string>>;
  description: string
  setDescription: Dispatch<SetStateAction<string>>;
};

export const ModelBase: FC<ModelBaseProps> = ({ isEditing, title, setTitle, description, setDescription }) => {
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
    </>
  );
}

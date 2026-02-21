import React from "react";
import { type Metadata, type NextPage } from "next";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Paper } from "@mantine/core";
import { EditModel } from "./_components/edit";

export const metadata: Metadata = {
  title: "Edit model | MadPrints",
};

type EditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditPage: NextPage<EditPageProps> = async (props) => {
  const { id } = await props.params;
  const modelData = await api.model.editProps({ id });
  if (!modelData) {
    return notFound();
  }
  const categories = await api.public.categories();
  return (
    <Paper>
      <EditModel
        description={modelData.description}
        id={modelData.id}
        title={modelData.title}
        categories={categories}
        category={modelData.categoryId}
        images={modelData.images} />
    </Paper>
  );
};

export default EditPage;

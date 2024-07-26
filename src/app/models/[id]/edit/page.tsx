import React from "react";
import { type NextPage } from "next";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Paper } from "@mantine/core";
import { EditModel } from "./_components/edit";

type EditPageProps = {
  params: {
    id: string;
  };
};

const EditPage: NextPage<EditPageProps> = async ({ params }) => {
  const modelData = await api.model.editProps({ id: params.id });
  if (!modelData) {
    return notFound();
  }
  return (
    <Paper>
      <EditModel description={modelData.description} id={modelData.id} title={modelData.title} />
    </Paper>
  );
};

export default EditPage;

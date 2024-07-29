import React from "react";
import { type NextPage } from "next";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Paper } from "@mantine/core";
import { NewIteration } from "./_components/newIteration";

type NewIterationPageProps = {
  params: {
    id: string;
  };
};

const NewIterationPage: NextPage<NewIterationPageProps> = async ({ params }) => {
  const modelData = await api.model.newIterationProps({ id: params.id });
  if (!modelData) {
    return notFound();
  }
  return (
    <Paper>
      <NewIteration lastCode={modelData.iteration.code} lastParameters={modelData.iteration.parameters} modelId={modelData.id} />
    </Paper>
  );
};

export default NewIterationPage;

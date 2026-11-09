import React from "react";
import { type Metadata, type NextPage } from "next";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { NewIteration } from "./_components/newIteration";

export const metadata: Metadata = {
  title: "Add new version",
};

type NewIterationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const NewIterationPage: NextPage<NewIterationPageProps> = async (props) => {
  const { id } = await props.params;
  const modelData = await api.model.newIterationProps({ id });
  if (!modelData) {
    return notFound();
  }
  return (
    <NewIteration lastCode={modelData.iteration.code} lastParameters={modelData.iteration.parameters} modelId={modelData.id} />
  );
};

export default NewIterationPage;

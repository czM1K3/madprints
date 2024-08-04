import React from "react";
import { type Metadata, type NextPage } from "next";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { Paper } from "@mantine/core";
import { CreateModel } from "./_components/create";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Create new model | MadPrints",
};

const CreatePage: NextPage = async () => {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  const categories = await api.public.categories();
  return (
    <Paper>
      <CreateModel categories={categories} />
    </Paper>
  );
}

export default CreatePage;

import React from "react";
import { type Metadata, type NextPage } from "next";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { CreateModel } from "./_components/create";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Create new model",
};

const CreatePage: NextPage = async () => {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  const categories = await api.public.categories();
  return <CreateModel categories={categories} />;
};

export default CreatePage;

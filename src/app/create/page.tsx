import React from "react";
import { type NextPage } from "next";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { Paper } from "@mantine/core";
import { CreateModel } from "./_components/create";

const CreatePage: NextPage = async () => {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  return (
    <Paper>
      <CreateModel />
    </Paper>
  );
}

export default CreatePage;
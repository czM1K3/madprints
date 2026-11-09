import { notFound } from "next/navigation";
import React, { type FC } from "react";
import { type Metadata } from "next";
import { ModelsPage } from "~/app/_components/modelsPage";
import { api, HydrateClient } from "~/trpc/server";

type UserPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: UserPageProps): Promise<Metadata> => {
  const { id } = await params;
  const user = await api.public.userPage({ id }).catch(() => null);
  return { title: user?.name ?? "User" };
};

const UserPage: FC<UserPageProps> = async ({ params }) => {
  const { id } = await params;
  const userData = await api.public.userPage({ id }).catch(() => null);
  if (!userData) {
    return notFound();
  }
  const models = await api.public.modelsPage({ page: 1, user: userData.id });
  const categories = await api.public.categories();
  return (
    <HydrateClient>
      <h1>Models by {userData.name ?? "Unknown"}</h1>
      <ModelsPage initialData={models} categories={categories} userId={userData.id} />
    </HydrateClient>
  );
};

export default UserPage;

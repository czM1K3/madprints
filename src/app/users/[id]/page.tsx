import { Title } from "@mantine/core";
import { notFound } from "next/navigation";
import React, { type FC } from "react";
import { ModelsPage } from "~/app/_components/modelsPage";
import { api, HydrateClient } from "~/trpc/server";

type UserPageProps = {
  params: {
    id: string;
  };
};

const UserPage: FC<UserPageProps> = async ({ params }) => {
  const userData = await api.public.userPage({
    id: params.id,
  }).catch(() => null);
  if (!userData) {
    return notFound();
  }
  const models = await api.public.modelsPage({
    page: 1,
    user: userData.id,
  });
  const categories = await api.public.categories();
  return (
    <HydrateClient>
      <main>
        <Title>{userData.name}</Title>
        <ModelsPage initialData={models} categories={categories} userId={userData.id} />
      </main>
    </HydrateClient>
  );
}

export default UserPage;

import React, { type FC } from "react";
import { api } from "~/trpc/server";
import { ModelCard } from "./card";
import { Center, SimpleGrid } from "@mantine/core";
import { ModelsPagination } from "./pagination";
import { notFound } from "next/navigation";


type ModelsPageProps = {
  page: number;
}

export const ModelsPage: FC<ModelsPageProps> = async ({ page }) => {
  const models = await api.public.modelsPage({ page });
  if (models.models.length < 1)
    return notFound();
  return (
    <>
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
      >
        {models.models.map((model) => (
          <Center key={model.id}>
            <ModelCard description={model.description} id={model.id} title={model.title} />
          </Center>
          ))}
      </SimpleGrid>
      <Center p="sm">
        <ModelsPagination currentPage={page} maxPages={models.pages} />
      </Center>
    </>
  );
};

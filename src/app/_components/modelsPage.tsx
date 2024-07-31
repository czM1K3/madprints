"use client";

import React, { useState, type FC } from "react";
import { ModelCard } from "./card";
import { Center, Pagination, SimpleGrid, Text } from "@mantine/core";
import { api } from "~/trpc/react";

type ModelsPageProps = {
  initialData: {
    models: {
        id: string;
        description: string;
        title: string;
    }[];
    pages: number;
  };
};

export const ModelsPage: FC<ModelsPageProps> = ({ initialData }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = api.public.modelsPage.useQuery({ page }, {
    initialData,
    initialDataUpdatedAt: 0,
  });
  if (isLoading)
    return (
      <Text>Loading</Text>
    );
  if (Boolean(error) || !data || data.models.length < 1)
    // return notFound();
    return (
      <Text>Error</Text>
    );
  return (
    <>
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
      >
        {data.models.map((model) => (
          <Center key={model.id}>
            <ModelCard description={model.description} id={model.id} title={model.title} />
          </Center>
          ))}
      </SimpleGrid>
      <Center p="sm" m="sm">
        <Pagination total={data.pages} value={page} onChange={(v) => setPage(v)} />
      </Center>
    </>
  );
};

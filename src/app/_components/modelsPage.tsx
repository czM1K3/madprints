"use client";

import React, { useEffect, useState, type FC } from "react";
import { ModelCard } from "./card";
import { Box, Center, LoadingOverlay, Pagination, Paper, Select, SimpleGrid, Text, TextInput } from "@mantine/core";
import { api } from "~/trpc/react";
import { useDebouncedValue } from "@mantine/hooks";
import { env } from "~/env";
import { type Categories } from "../_types/categories";

type ModelsPageProps = {
  initialData: {
    models: {
      id: string;
      description: string;
      title: string;
      category: {
        id: string;
        name: string;
      } | null;
    }[];
    pages: number;
  };
  categories: Categories;
  userId?: string;
};

export const ModelsPage: FC<ModelsPageProps> = ({ initialData, categories, userId }) => {
  const [page, setPage] = useState(1);
  const [searchCurrent, setSearchCurrent] = useState("");
  const [search] = useDebouncedValue(searchCurrent, 500);
  const [category, setCategory] = useState("");

  const { data, isLoading, error, isRefetching } = api.public.modelsPage.useQuery({
    page,
    category: category || null,
    search: search || null,
    user: userId ?? null,
  }, {
    initialData,
    initialDataUpdatedAt: 0,
    refetchOnMount: false,
  });

  useEffect(() => {
    setPage(1);
  }, [search, category, setPage]);
  if (Boolean(error))
    // return notFound();
    return (
      <Text>Error</Text>
    );
  return (
    <>
      <Paper p="sm">
        <TextInput
          label="Search MadPrints"
          placeholder="Enter word to search for"
          value={searchCurrent}
          onChange={(event) => setSearchCurrent(event.currentTarget.value)}
        />
        <Select
          label="Category"
          placeholder="Pick category"
          data={categories.names}
          value={categories.keyName[category]}
          onChange={(v) => v ? setCategory(categories.nameKey[v] ?? "") : "" }
        />
      </Paper>
      <Box pos="relative">
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
        >
          {(isLoading || isRefetching) ? (
            Array.from(Array(env.NEXT_PUBLIC_PER_PAGE).keys()).map((_i, key) => (
              <ModelCard key={key} description="Loading" id="loading" title="Loading" />
            ))
          ) : (
            data.models.map((model) => (
              <ModelCard key={model.id} description={model.description} id={model.id} title={model.title} category={model.category?.name} />
            ))
          )}
        </SimpleGrid>
        <Center p="sm" m="sm">
          <Pagination total={data.pages} value={page} onChange={(v) => setPage(v)} />
        </Center>
        <LoadingOverlay visible={isLoading || isRefetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Box>
    </>
  );
};

"use client";

import React, { useEffect, useState, type FC } from "react";
import { ModelCard } from "./card";
import { Center, Pagination, Paper, Select, SimpleGrid, Text, TextInput } from "@mantine/core";
import { api } from "~/trpc/react";
import { type KeyValue } from "../page";
import { useDebouncedValue } from "@mantine/hooks";

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
  categories: {
    names: string[];
    keyName: KeyValue;
    nameKey: KeyValue;
  };
};

export const ModelsPage: FC<ModelsPageProps> = ({ initialData, categories }) => {
  const [page, setPage] = useState(1);
  const [searchCurrent, setSearchCurrent] = useState("");
  const [search] = useDebouncedValue(searchCurrent, 500);
  const [category, setCategory] = useState("");

  const { data, isLoading, error, isRefetching } = api.public.modelsPage.useQuery({
    page,
    category: category || null,
    search: search || null,
  }, {
    initialData,
    initialDataUpdatedAt: 0,
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
      {(isLoading || isRefetching) ? (
        <Text>Loading</Text>
      ) : (
        <>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
          >
            {data.models.map((model) => (
              <Center key={model.id}>
                <ModelCard description={model.description} id={model.id} title={model.title} category={model.category?.name} />
              </Center>
              ))}
          </SimpleGrid>
          <Center p="sm" m="sm">
            <Pagination total={data.pages} value={page} onChange={(v) => setPage(v)} />
          </Center>
        </>
      )}
    </>
  );
};

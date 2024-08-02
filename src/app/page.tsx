import { api, HydrateClient } from "~/trpc/server";
import { ModelsPage } from "./_components/modelsPage";

export type KeyValue = Record<string, string>;

const Home = async () => {
  const models = await api.public.modelsPage({ page: 1 });
  const categoriesRaw = await api.public.categories();
  const categories = {
    names: ["None", ...categoriesRaw.map(({ name }) => name)],
    keyName: categoriesRaw.reduce((categories, current) => {
      categories[current.id] = current.name;
      return categories;
    }, { "": "None" } as KeyValue),
    nameKey: categoriesRaw.reduce((categories, current) => {
      categories[current.name] = current.id;
      return categories;
    }, { "None": "" } as KeyValue),
  };

  return (
    <HydrateClient>
      <ModelsPage initialData={models} categories={categories} />
    </HydrateClient>
  );
}

export default Home;

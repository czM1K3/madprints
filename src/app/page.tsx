import { api, HydrateClient } from "~/trpc/server";
import { ModelsPage } from "./_components/modelsPage";



const Home = async () => {
  const models = await api.public.modelsPage({ page: 1 });
  const categories = await api.public.categories();

  return (
    <HydrateClient>
      <ModelsPage initialData={models} categories={categories} />
    </HydrateClient>
  );
}

export default Home;

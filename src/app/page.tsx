import { api, HydrateClient } from "~/trpc/server";
import { ModelsPage } from "./_components/modelsPage";

const Home = async () => {
  const models = await api.public.modelsPage({ page: 1 });

  return (
    <HydrateClient>
      <ModelsPage initialData={models} />
    </HydrateClient>
  );
}

export default Home;

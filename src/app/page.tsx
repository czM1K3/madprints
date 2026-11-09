import { api, HydrateClient } from "~/trpc/server";
import { ModelsPage } from "./_components/modelsPage";

const Home = async () => {
  const models = await api.public.modelsPage({ page: 1 });
  const categories = await api.public.categories();

  return (
    <HydrateClient>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">Tweak it. Generate it. Print it!</h1>
        <p>Browse customizable 3D models, change their parameters and download a print-ready STL.</p>
        <span className="shape s1" aria-hidden="true" />
        <span className="shape s2" aria-hidden="true" />
        <span className="shape s3" aria-hidden="true" />
      </section>
      <h2 className="visually-hidden">All models</h2>
      <ModelsPage initialData={models} categories={categories} />
    </HydrateClient>
  );
};

export default Home;

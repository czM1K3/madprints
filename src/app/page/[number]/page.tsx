import { type NextPage } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ModelsPage } from "~/app/_components/modelsPage";
import { HydrateClient } from "~/trpc/server";

type PagePageProps = {
  params: {
    number: string;
  };
};

const PagePage: NextPage<PagePageProps> = ({ params }) => {
  const parsed = z.coerce.number().safeParse(params.number);

  if (!parsed.success)
    return notFound();

  return (
    <HydrateClient>
      <main>
        <ModelsPage page={parsed.data} />
      </main>
    </HydrateClient>
  );
}

export default PagePage;

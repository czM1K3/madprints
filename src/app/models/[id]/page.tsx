import { Button, Paper, Title, TypographyStylesProvider } from "@mantine/core";
import { notFound } from "next/navigation";
import { type FC } from "react";
import { api, HydrateClient } from "~/trpc/server";
import { ModelGenerator } from "./_components/generator";
import { UserInfo } from "./_components/user";
import { auth } from "~/server/auth";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import Markdown from "markdown-to-jsx";
import { ImagesCarousel } from "./_components/images";

type ModelPageProps = {
  params: {
    id: string;
  };
};

export const generateMetadata = async ({ params }: ModelPageProps, _parent: ResolvingMetadata): Promise<Metadata> => {
  const title = await api.public.modelTitle({ id: params.id }).catch(() => null);
  return {
    title: title ? `${title} | MadPrints`: "Model not found",
  };
};

const ModelPage: FC<ModelPageProps> = async ({ params }) => {
  const modelData = await api.public.modelPage({ id: params.id }).catch(() => null);
  if (!modelData) {
    return notFound();
  }
  const session = await auth();
  return (
    <HydrateClient>
      <main>
        <Paper shadow="xs" p="sm" m="md">
          <Title>{modelData.title}</Title>
          <Title order={2} c="gray" size={20}>{modelData.created_at.toLocaleString("en-us")}</Title>
          <UserInfo id={modelData.user.id} image={modelData.user.image} name={modelData.user.name} />
          <ImagesCarousel images={modelData.images} />
          <TypographyStylesProvider>
            <Markdown>{modelData.description}</Markdown>
          </TypographyStylesProvider>
          {session && session.user && session.user.id === modelData.user.id && (
            <>
              <Button component={Link} href={`/models/${modelData.id}/edit`} m="sm">Edit</Button>
              <Button component={Link} href={`/models/${modelData.id}/new-iteration`} m="sm">New iteration</Button>
            </>
          )}
        </Paper>
        {modelData.iterations.length > 0 && (
          <ModelGenerator iterations={modelData.iterations} />
        )}
      </main>
    </HydrateClient>
  );
}

export default ModelPage;

import { Box, Button, Card, Title, TypographyStylesProvider } from "@mantine/core";
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
        <Card shadow="sm" withBorder p="sm" mt="md" mb="md">
          <Title>{modelData.title}</Title>
          <UserInfo id={modelData.user.id} image={modelData.user.image} name={modelData.user.name} />
          <ImagesCarousel images={modelData.images} />
          <TypographyStylesProvider>
            <Markdown>{modelData.description}</Markdown>
          </TypographyStylesProvider>
          {session && session.user && session.user.id === modelData.user.id && (
            <Box>
              <Button component={Link} href={`/models/${modelData.id}/edit`} m="xs">Edit</Button>
              <Button component={Link} href={`/models/${modelData.id}/new-iteration`} m="xs">New iteration</Button>
            </Box>
          )}
        </Card>
        {modelData.iterations.length > 0 && (
          <ModelGenerator iterations={modelData.iterations} />
        )}
      </main>
    </HydrateClient>
  );
}

export default ModelPage;
